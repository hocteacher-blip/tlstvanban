import React, { useState } from 'react';
import {
  MessageSquareText,
  Upload,
  BookOpen,
  Sparkles,
  Send,
  FileText,
  Search,
  Scale,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { apiService } from '../../services/api';

interface DocItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  isBuiltIn?: boolean;
}

const PRELOADED_LAWS: DocItem[] = [
  {
    id: 'law_32_2020',
    title: 'Thông tư số 32/2020/TT-BGDĐT - Điều lệ trường THCS, THPT',
    category: 'Văn bản quy phạm',
    summary: 'Quy định về tổ chức trường học, nhiệm vụ và quyền của giáo viên, học sinh, hội đồng trường và các tổ chuyên môn.',
    content: `Điều 27. Nhiệm vụ của giáo viên:
1. Thực hiện nhiệm vụ giảng dạy, giáo dục theo kế hoạch giáo dục của nhà trường và kế hoạch dạy học của tổ chuyên môn; quản lý học sinh trong các hoạt động giáo dục do nhà trường tổ chức; tham gia các hoạt động của tổ chuyên môn; tham gia sinh hoạt chi bộ khi là đảng viên.
2. Rèn luyện đạo đức, gương mẫu trước học sinh; thương yêu, tôn trọng, đối xử công bằng với học sinh, bảo vệ các quyền và lợi ích chính đáng của học sinh.
3. Học tập, rèn luyện nâng cao phẩm chất chính trị, chuyên môn nghiệp vụ; đổi mới phương pháp dạy học và kiểm tra đánh giá.
4. Tham gia tập huấn, bồi dưỡng chuyên môn, nghiệp vụ.

Điều 29. Quyền của giáo viên:
1. Được tự chủ thực hiện nhiệm vụ chuyên môn với sự phân công, phối hợp của tổ chuyên môn và nhà trường.
2. Được hưởng tiền lương, phụ cấp, chính sách ưu đãi theo quy định.
3. Được tạo điều kiện học tập nâng cao trình độ, bồi dưỡng chuyên môn nghiệp vụ.
4. Được bảo vệ nhân phẩm, danh dự và sức khỏe trong khi thi hành nhiệm vụ.`,
    isBuiltIn: true,
  },
  {
    id: 'law_30_2020',
    title: 'Nghị định số 30/2020/NĐ-CP của Chính phủ về Công tác văn thư',
    category: 'Thể thức hành chính',
    summary: 'Quy định chi tiết về thể thức, kỹ thuật trình bày văn bản hành chính; quản lý văn bản đi, đến và lưu trữ văn thư.',
    content: `Điều 8. Các thành phần thể thức văn bản hành chính:
1. Quốc hiệu và Tiêu ngữ.
2. Tên cơ quan, tổ chức ban hành văn bản.
3. Số, ký hiệu của văn bản.
4. Địa danh và thời gian ban hành văn bản.
5. Tên loại và trích yếu nội dung văn bản.
6. Nội dung văn bản.
7. Chức vụ, họ tên và chữ ký của người có thẩm quyền.
8. Dấu, chữ ký số của cơ quan, tổ chức.
9. Nơi nhận.

Quy định về phông chữ và khổ giấy:
- Sử dụng phông chữ tiếng Việt Times New Roman, bộ mã ký tự Unicode theo Tiêu chuẩn Việt Nam TCVN 6909:2001.
- Khổ giấy A4 (210 mm x 297 mm), chiều trình bày theo chiều đứng của khổ giấy.`,
    isBuiltIn: true,
  },
  {
    id: 'law_22_2021',
    title: 'Thông tư số 22/2021/TT-BGDĐT - Đánh giá học sinh THCS và THPT',
    category: 'Chuyên môn giáo dục',
    summary: 'Quy định phương pháp đánh giá định tính, định lượng, xếp loại học lực, rèn luyện theo Chương trình GDPT 2018.',
    content: `Điều 9. Đánh giá kết quả rèn luyện của học sinh:
- Kết quả rèn luyện của học sinh trong từng học kỳ và cả năm học được đánh giá theo 01 (một) trong 04 (bốn) mức: Tốt, Khá, Đạt, Chưa đạt.
Điều 15. Khen thưởng học sinh:
- Danh hiệu 'Học sinh Xuất sắc': Có kết quả rèn luyện và học tập cả năm đạt mức Tốt và có ít nhất 06 môn học có điểm trung bình từ 9,0 trở lên.
- Danh hiệu 'Học sinh Giỏi': Có kết quả rèn luyện và học tập cả năm đạt mức Tốt.`,
    isBuiltIn: true,
  },
];

export const DocumentQaView: React.FC = () => {
  const [documents, setDocuments] = useState<DocItem[]>(PRELOADED_LAWS);
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [question, setQuestion] = useState<string>('');
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<
    { q: string; a: string; time: string }[]
  >([]);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const currentQ = question;
    setQuestion('');
    setIsAnswering(true);

    try {
      const activeDocs =
        selectedDocId === 'all'
          ? documents
          : documents.filter((d) => d.id === selectedDocId);

      const res = await apiService.askDocQa({
        question: currentQ,
        documents: activeDocs.map((d) => ({ title: d.title, content: d.content })),
      });

      if (res.success && res.answer) {
        setChatHistory((prev) => [
          ...prev,
          { q: currentQ, a: res.answer, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
        ]);
      } else {
        alert('Lỗi: ' + (res.error || 'Không thể nhận câu trả lời'));
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const newDoc: DocItem = {
        id: 'doc_' + Date.now(),
        title: file.name,
        category: 'Tài liệu tải lên',
        summary: `Tài liệu tải lên từ máy tính (${file.size} bytes)`,
        content: text.slice(0, 30000),
      };
      setDocuments((prev) => [...prev, newDoc]);
      alert(`Đã thêm tài liệu "${file.name}" vào kho tri thức.`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-1">
            <MessageSquareText className="w-3.5 h-3.5 text-purple-600" />
            <span>Kho tri thức pháp luật & Hỏi đáp tài liệu</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Hỏi đáp văn bản pháp luật & Tài liệu chuyên môn AI
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tra cứu Thông tư 32/2020, Thông tư 28/2020, Nghị định 30/2020, Thông tư 22/2021 hoặc tải văn bản nội bộ lên để hỏi đáp, so sánh và trích xuất căn cứ pháp lý minh bạch.
          </p>
        </div>

        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Thêm tài liệu (PDF/TXT)</span>
          <input type="file" accept=".txt,.pdf,.docx" onChange={handleCustomUpload} className="hidden" />
        </label>
      </div>

      {/* Grid: Knowledge Base Documents (4 cols) & Chat/Q&A Window (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Documents List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Kho văn bản tham chiếu ({documents.length}):</span>
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedDocId('all')}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                  selectedDocId === 'all'
                    ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tra cứu trên toàn bộ kho văn bản (Đề xuất)
              </button>

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedDocId === doc.id
                      ? 'border-purple-500 bg-purple-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[10px] font-semibold text-purple-700 uppercase mb-1">
                    {doc.category}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{doc.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transparent Citation Notice */}
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200 text-xs space-y-1.5 text-purple-950">
            <div className="font-bold flex items-center gap-1">
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Tiêu chuẩn dẫn nguồn minh bạch:</span>
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              Mọi câu trả lời của AI đều được phân định rõ ràng giữa: Căn cứ pháp lý có trong văn bản, Khuyến nghị suy luận của AI, và Những điểm chưa có trong tài liệu.
            </p>
          </div>
        </div>

        {/* Right Column: Q&A Conversation Stream (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between h-[640px]">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            {chatHistory.length === 0 && !isAnswering && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MessageSquareText className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-700">Chưa có câu hỏi nào</div>
                <p className="text-xs text-slate-500 max-w-md">
                  Hãy nhập câu hỏi vào ô bên dưới để tra cứu quy chế, quyền và nhiệm vụ của giáo viên, chuẩn thể thức văn bản hoặc phân tích tài liệu của trường.
                </p>
              </div>
            )}
            {chatHistory.map((item, idx) => (
              <div key={idx} className="space-y-3">
                {/* User Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-purple-600 text-white p-3 rounded-2xl rounded-tr-xs text-xs md:text-sm">
                    {item.q}
                  </div>
                </div>

                {/* AI Answer Bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] bg-slate-50 border border-slate-200 p-4 rounded-2xl rounded-tl-xs text-xs md:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed space-y-2 font-serif">
                    <div className="flex items-center gap-1.5 text-[11px] font-sans font-bold text-purple-700 border-b pb-1 border-slate-200">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Trợ lý Pháp luật Trường học ({item.time})</span>
                    </div>
                    {item.a}
                  </div>
                </div>
              </div>
            ))}

            {isAnswering && (
              <div className="flex justify-start">
                <div className="bg-purple-50 text-purple-800 p-3 rounded-2xl text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
                  <span>AI đang đối chiếu điều khoản và soạn thảo câu trả lời...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Đặt câu hỏi về quy định, điều lệ trường học, thể thức văn bản hành chính..."
              className="flex-1 text-xs md:text-sm p-3 border border-slate-300 rounded-xl focus:outline-purple-500 bg-slate-50"
            />
            <button
              onClick={handleAskQuestion}
              disabled={isAnswering || !question.trim()}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
