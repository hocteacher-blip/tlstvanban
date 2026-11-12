// Client API service for SCHOOL DOC AI
export interface GenerateParams {
  prompt: string;
  systemInstruction?: string;
  type?: string;
}

export interface AnalyzeFormParams {
  formText: string;
  formTitle?: string;
}

export interface TranscribeParams {
  audioData: string; // base64
  mimeType: string;
  meetingType: string;
  contextInfo?: string;
}

export interface OcrParams {
  imageData: string; // base64
  mimeType: string;
  mode?: 'full' | 'text_only' | 'table_only';
}

export interface DocQaParams {
  question: string;
  documents: { title: string; content: string }[];
}

export interface CheckFormatParams {
  documentContent: string;
  documentType: string;
}

export const apiService = {
  // Check health and API key status
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch (e) {
      return { status: 'error', hasApiKey: false, error: 'Không thể kết nối đến máy chủ backend.' };
    }
  },

  // Generate or revise administrative content
  async generateText(params: GenerateParams): Promise<{ success: boolean; text: string; error?: string }> {
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi gọi AI');
      return data;
    } catch (err: any) {
      console.error('generateText error:', err);
      return { success: false, text: '', error: err.message || 'Lỗi kết nối máy chủ' };
    }
  },

  // Analyze structure of an uploaded Word/Excel/PDF form
  async analyzeForm(params: AnalyzeFormParams) {
    try {
      const res = await fetch('/api/gemini/analyze-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi phân tích biểu mẫu');
      return data;
    } catch (err: any) {
      console.error('analyzeForm error:', err);
      return { success: false, fields: [], error: err.message };
    }
  },

  // Speech to text meeting minutes
  async transcribeAudio(params: TranscribeParams) {
    try {
      const res = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi xử lý âm thanh');
      return data;
    } catch (err: any) {
      console.error('transcribeAudio error:', err);
      return { success: false, transcript: '', error: err.message };
    }
  },

  // OCR image/PDF to text & tables
  async performOcr(params: OcrParams) {
    try {
      const res = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi nhận diện hình ảnh');
      return data;
    } catch (err: any) {
      console.error('performOcr error:', err);
      return { success: false, content: '', error: err.message };
    }
  },

  // Knowledge base Q&A
  async askDocQa(params: DocQaParams) {
    try {
      const res = await fetch('/api/gemini/doc-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi hỏi đáp tài liệu');
      return data;
    } catch (err: any) {
      console.error('askDocQa error:', err);
      return { success: false, answer: '', error: err.message };
    }
  },

  // Check administrative format compliance (Nghị định 30/2020)
  async checkFormat(params: CheckFormatParams) {
    try {
      const res = await fetch('/api/gemini/check-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi kiểm tra thể thức');
      return data;
    } catch (err: any) {
      console.error('checkFormat error:', err);
      return { success: false, report: null, error: err.message };
    }
  },

  // Interactive AI Assistant chat
  async assistantChat(params: {
    message: string;
    history: { role: 'user' | 'model'; text: string }[];
    schoolContext?: any;
  }): Promise<{ success: boolean; text: string; error?: string }> {
    try {
      const res = await fetch('/api/gemini/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi kết nối với Trợ lý AI');
      return data;
    } catch (err: any) {
      console.error('assistantChat error:', err);
      return { success: false, text: '', error: err.message || 'Lỗi kết nối máy chủ' };
    }
  },
};
