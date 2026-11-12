import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware for parsing JSON with generous size for images & audio base64
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Helper to get GoogleGenAI instance safely with telemetry header
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient content generator with quick retry for temporary high demand (503)
async function generateWithFallback(ai: GoogleGenAI, options: any) {
  try {
    return await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      ...options,
    });
  } catch (err: any) {
    const errStr = String(err?.message || err);
    if (err?.status === 503 || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE')) {
      console.warn('Gemini 3.8 flash experiencing temporary spike, retrying once...');
      await new Promise((r) => setTimeout(r, 600));
      return await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        ...options,
      });
    }
    throw err;
  }
}

// 1. Health check & API status
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    app: 'SCHOOL DOC AI',
    version: '1.0.0',
    model: 'gemini-3.8-flash',
  });
});

// 2. Text generation & Administrative Drafting
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, systemInstruction, type } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAIClient();
    const defaultInstruction = `Bạn là Trợ lý Soạn thảo & Văn thư Hành chính Cao cấp cho Trường học Việt Nam (SCHOOL DOC AI).
Quy tắc bắt buộc:
1. Tuân thủ chuẩn thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP (Quốc hiệu, Tiêu ngữ, Tên cơ quan, Số & Ký hiệu, Địa danh ngày tháng, Tên loại & Trích yếu, Nội dung, Thẩm quyền & Chữ ký, Nơi nhận).
2. Dùng đại từ, chức danh và thuật ngữ chính xác trong môi trường giáo dục (Hiệu trưởng, Phó Hiệu trưởng, Tổ trưởng chuyên môn, Giáo viên, Hội đồng trường, Phòng GD&ĐT, Sở GD&ĐT, UBND).
3. KHÔNG tự bịa số hiệu, số căn cứ pháp lý, tên người ký. Nếu thiếu thông tin bắt buộc phải đánh dấu bằng [CẦN BỔ SUNG: mô tả].
4. Ngôn ngữ tiếng Việt chuẩn mực, mạch lạc, trang trọng, logic và đúng văn phong hành chính.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || defaultInstruction,
      },
    });

    res.json({
      success: true,
      text: response.text || '',
    });
  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({
      error: error.message || 'Lỗi khi gọi mô hình AI',
      details: error.toString(),
    });
  }
});

// 3. Form Field Identification (Module 2)
app.post('/api/gemini/analyze-form', async (req: Request, res: Response) => {
  try {
    const { formText, formTitle } = req.body;
    if (!formText) {
      return res.status(400).json({ error: 'formText is required' });
    }

    const ai = getAIClient();
    const prompt = `Phân tích cấu trúc biểu mẫu trường học sau đây:
Tiêu đề: ${formTitle || 'Biểu mẫu'}
Nội dung văn bản:
"""
${formText.slice(0, 15000)}
"""

Hãy nhận diện tất cả các vị trí cần điền thông tin (ô trống, dấu chấm '...', các ngoặc vuông '[...]', '{{...}}', thông tin trường học, thông tin giáo viên, học sinh, số liệu trong bảng).
Trả về JSON danh sách các trường với cấu trúc:
[
  {
    "id": "field_unique_id",
    "label": "Tên trường hiển thị bằng tiếng Việt dễ hiểu",
    "placeholder": "Ví dụ gợi ý nhập",
    "type": "text" | "date" | "number" | "select" | "textarea",
    "category": "school" | "officer" | "student" | "content" | "date" | "other",
    "defaultValue": "Giá trị mặc định nếu nhận diện được hoặc rỗng",
    "required": true
  }
]
CHỈ trả về JSON mảng hợp lệ, không bọc markdown khác.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ success: true, fields: parsed });
  } catch (error: any) {
    console.error('Error analyzing form:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi phân tích biểu mẫu' });
  }
});

// 4. Meeting Minutes & Audio Transcription (Module 4)
app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType, meetingType, contextInfo } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'audioData base64 is required' });
    }

    const ai = getAIClient();
    const prompt = `Bạn là Trợ lý Thư ký cuộc họp Trường học chuyên nghiệp.
Nhiệm vụ:
1. Chuyển đổi và phân tích nội dung cuộc họp từ bản ghi âm đính kèm.
2. Cuộc họp thuộc loại: ${meetingType || 'Biên bản họp Hội đồng sư phạm / Chuyên môn'}.
3. Thông tin ngữ cảnh bổ sung: ${contextInfo || 'Không có'}.
4. Lập Biên bản họp hoàn chỉnh chuẩn thể thức hành chính trường học gồm:
- Tên biên bản (in hoa)
- Thời gian, địa điểm
- Thành phần tham dự (Chủ trì, Thư ký, Đại biểu/Giáo viên)
- Mục đích / Nội dung trọng tâm
- Diễn biến cuộc họp và ý kiến thảo luận chi tiết
- Kết luận của Chủ trì cuộc họp
- Phân công nhiệm vụ cụ thể (Người/Bộ phận thực hiện, Nội dung nhiệm vụ, Thời hạn hoàn thành)
- Chữ ký của Thư ký và Chủ trì.
Lưu ý: Không tự ý gán tên người phát biểu cụ thể khi bản ghi âm không nêu rõ; thay vào đó ghi 'Ý kiến thảo luận' hoặc 'Đại diện tổ chuyên môn'.`;

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioData,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [audioPart, { text: prompt }] },
    });

    res.json({
      success: true,
      transcript: response.text || '',
    });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi xử lý âm thanh' });
  }
});

// 5. OCR & Image/PDF to Word (Module 5)
app.post('/api/gemini/ocr', async (req: Request, res: Response) => {
  try {
    const { imageData, mimeType, mode } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'imageData base64 is required' });
    }

    const ai = getAIClient();
    let instruction = `Bạn là Chuyên gia OCR nhận dạng văn bản tiếng Việt và công văn hành chính trường học độ chính xác cao.
Nhiệm vụ:
1. Nhận diện chuẩn xác từng ký tự tiếng Việt có dấu, chữ in hoa, chữ in nghiêng, số liệu, số hiệu văn bản.
2. Tái tạo cấu trúc bảng biểu nếu có (dưới dạng markdown table rõ ràng).
3. Nhận diện khu vực Tiêu đề, Quốc hiệu, Tiêu ngữ, Số văn bản, Nơi nhận, Chức vụ và vùng chữ ký/con dấu (ghi chú [Chữ ký và Con dấu: ...]).`;

    if (mode === 'text_only') {
      instruction += '\nChỉ trích xuất văn bản thuần tuý, không thêm định dạng phức tạp.';
    } else if (mode === 'table_only') {
      instruction += '\nTập trung trích xuất chính xác các bảng biểu và dữ liệu số sang bảng markdown.';
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/png',
        data: imageData,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, { text: 'Hãy OCR và trích xuất toàn bộ nội dung trong hình ảnh này theo đúng hướng dẫn.' }] },
      config: {
        systemInstruction: instruction,
      },
    });

    res.json({
      success: true,
      content: response.text || '',
    });
  } catch (error: any) {
    console.error('Error performing OCR:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi nhận diện hình ảnh/PDF' });
  }
});

// 6. Document Q&A / Knowledge base (Module 6)
app.post('/api/gemini/doc-qa', async (req: Request, res: Response) => {
  try {
    const { question, documents } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const ai = getAIClient();
    const docContext = (documents || [])
      .map((d: any, idx: number) => `--- TÀI LIỆU [${idx + 1}]: ${d.title} ---\n${(d.content || '').slice(0, 10000)}`)
      .join('\n\n');

    const prompt = `Dưới đây là các tài liệu tham khảo trường học:
${docContext}

CÂU HỎI CỦA NGƯỜI DÙNG: "${question}"

YÊU CẦU TRẢ LỜI:
1. Phân biệt rõ 3 phần trong câu trả lời:
   - [Nội dung có trong tài liệu]: Trích dẫn cụ thể căn cứ, điều khoản, số trang hoặc tên tài liệu.
   - [Nội dung AI suy luận / Khuyến nghị thực tế]: Phân tích áp dụng tại trường học.
   - [Nội dung không tìm thấy trong tài liệu]: Nêu rõ điểm tài liệu chưa đề cập để người dùng kiểm tra bổ sung.
2. Trả lời bằng văn phong quản lý giáo dục mạch lạc, chuẩn xác.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      answer: response.text || '',
    });
  } catch (error: any) {
    console.error('Error in doc Q&A:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi hỏi đáp tài liệu' });
  }
});

// 7. Check Administrative Format (Module 12)
app.post('/api/gemini/check-format', async (req: Request, res: Response) => {
  try {
    const { documentContent, documentType } = req.body;
    const ai = getAIClient();

    const prompt = `Kiểm tra thể thức văn bản hành chính sau đây theo Nghị định 30/2020/NĐ-CP của Chính phủ về công tác văn thư:
Loại văn bản: ${documentType || 'Văn bản hành chính'}
Nội dung:
"""
${(documentContent || '').slice(0, 12000)}
"""

Hãy đánh giá chi tiết theo các tiêu chí:
1. Quốc hiệu và Tiêu ngữ (đúng chuẩn chưa)
2. Tên cơ quan, tổ chức ban hành văn bản
3. Số, ký hiệu văn bản
4. Địa danh và ngày tháng năm ban hành
5. Tên loại và trích yếu nội dung
6. Thẩm quyền ký, chức vụ và họ tên người ký
7. Nơi nhận
8. Văn phong, ngữ pháp và chính tả
Trả về JSON cấu trúc:
{
  "score": 85, // thang điểm 100
  "summary": "Tóm tắt đánh giá chung",
  "passItems": ["Tiêu chí đạt 1", "Tiêu chí đạt 2"],
  "issues": [
    {
      "element": "Tên thành phần bị lỗi (ví dụ: Số ký hiệu)",
      "current": "Nội dung hiện tại trong văn bản",
      "suggestion": "Cách sửa đổi theo Nghị định 30/2020/NĐ-CP"
    }
  ],
  "improvedVersion": "Toàn văn văn bản đã được chuẩn hóa lại đúng thể thức"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, report: parsed });
  } catch (error: any) {
    console.error('Error checking format:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi kiểm tra thể thức' });
  }
});

// 8. Interactive AI Assistant / School Copilot
app.post('/api/gemini/assistant-chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], schoolContext } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const ai = getAIClient();

    let schoolContextText = '';
    if (schoolContext) {
      schoolContextText = `\nThông tin đơn vị của người dùng:
- Tên trường: ${schoolContext.schoolName || 'Chưa thiết lập'}
- Cơ quan chủ quản: ${schoolContext.governingBody || 'Chưa thiết lập'}
- Cấp học: ${schoolContext.schoolLevel || 'THCS'}
- Hiệu trưởng: ${schoolContext.principalName || 'Chưa thiết lập'}
- Địa chỉ: ${schoolContext.address || 'Chưa thiết lập'}`;
    }

    const systemInstruction = `Bạn là Trợ lý AI Nhà Trường (SCHOOL DOC AI Copilot) - Trợ lý thông minh cao cấp dành riêng cho công tác hành chính, văn thư, chuyên môn và quản trị trường học Việt Nam.
${schoolContextText}

Nhiệm vụ & Chức năng trọng tâm của bạn:
1. Hướng dẫn & soạn thảo văn bản hành chính theo chuẩn Nghị định 30/2020/NĐ-CP của Chính phủ (Quốc hiệu, Tiêu ngữ, Tên cơ quan, Số & Ký hiệu, Địa danh ngày tháng, Tên loại & Trích yếu, Nội dung, Thẩm quyền & Chữ ký, Nơi nhận).
2. Nắm vững hệ thống quy định sư phạm:
   - Điều lệ trường Tiểu học (Thông tư 28/2020/TT-BGDĐT) và THCS, THPT (Thông tư 32/2020/TT-BGDĐT).
   - Quy chế đánh giá học sinh: Thông tư 27/2020/TT-BGDĐT (Tiểu học) và Thông tư 22/2021/TT-BGDĐT (THCS, THPT).
   - Công văn 5512/BGDĐT-GDTrH về xây dựng kế hoạch dạy học, kế hoạch bài dạy.
   - Chế độ làm việc, tiêu chuẩn chức danh nghề nghiệp giáo viên (Thông tư 01, 02, 03, 04/2021/TT-BGDĐT và Thông tư 08/2023/TT-BGDĐT).
3. Hỗ trợ thao tác trong ứng dụng SCHOOL DOC AI:
   - Soạn thảo AI (Module 1): Sinh văn bản, mở rộng, rút gọn, kiểm tra lỗi.
   - Điền biểu mẫu Word/Excel (Module 2): Nhận diện ô trống, dấu chấm, ghép dữ liệu tự động.
   - Tạo văn bản hàng loạt từ Excel (Module 3): Trộn danh sách giáo viên/học sinh thành gói file Word .zip.
   - Chuyển ảnh/PDF sang Word bằng OCR (Module 5): Nhận diện chữ tiếng Việt có dấu và bảng biểu.
   - Ghi âm cuộc họp & Lập biên bản (Module 4): Ghi âm giọng nói, tóm tắt diễn biến, phân công nhiệm vụ.
   - Sổ văn bản Đi/Đến, Chuyển đổi phông chữ TCVN3/VNI sang Unicode, Kiểm tra thể thức Nghị định 30.
4. Phong cách phản hồi:
   - Trang trọng, lịch thiệp, chu đáo, súc tích và mạch lạc.
   - Dùng định dạng markdown đẹp mắt (in đậm các từ khóa quan trọng, danh sách đầu dòng, bảng biểu so sánh nếu phù hợp).
   - Khi người dùng yêu cầu soạn một văn bản cụ thể, hãy cung cấp toàn văn bản thảo hoàn chỉnh với đầy đủ các thành phần thể thức theo Nghị định 30/2020/NĐ-CP, đánh dấu [CẦN BỔ SUNG: ...] cho những thông tin cụ thể chưa được cung cấp.`;

    // Map history to GoogleGenAI content format
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.text) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
      }
    }
    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await generateWithFallback(ai, {
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({
      success: true,
      text: response.text || '',
    });
  } catch (error: any) {
    console.error('Error in assistant-chat:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi giao tiếp với Trợ lý AI' });
  }
});

// Start server with Vite middleware in development or static in production
async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SCHOOL DOC AI Server is listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
});
