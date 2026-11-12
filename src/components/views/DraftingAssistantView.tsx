import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Printer,
  Save,
  CheckCircle2,
  AlertCircle,
  Wand2,
  RefreshCw,
  SpellCheck,
  FileText,
  FileCheck,
  Maximize2,
  Minimize2,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { AdministrativeDocument, DocumentCategory, SchoolProfile } from '../../types';
import { apiService } from '../../services/api';
import { generateAdminDocx, downloadFile } from '../../utils/docxGenerator';

interface DraftingAssistantViewProps {
  schoolProfile: SchoolProfile;
  onSaveDocument: (doc: AdministrativeDocument) => void;
  initialDocument?: AdministrativeDocument | null;
}

const DOCUMENT_TYPES: { key: DocumentCategory; label: string; prefix: string; placeholder: string }[] = [
  { key: 'quyet_dinh', label: 'Quyết định', prefix: 'QĐ', placeholder: 'V/v phân công nhiệm vụ cán bộ, giáo viên năm học 2026 - 2027' },
  { key: 'cong_van', label: 'Công văn hành chính', prefix: 'CV', placeholder: 'V/v báo cáo số liệu và chuẩn bị điều kiện cơ sở vật chất năm học mới' },
  { key: 'thong_bao', label: 'Thông báo', prefix: 'TB', placeholder: 'V/v lịch nghỉ lễ Quốc khánh và tổ chức Lễ Khai giảng năm học mới' },
  { key: 'ke_hoach', label: 'Kế hoạch', prefix: 'KH', placeholder: 'Kế hoạch tổ chức Hội thi Giáo viên dạy giỏi cấp trường' },
  { key: 'bao_cao', label: 'Báo cáo', prefix: 'BC', placeholder: 'Báo cáo sơ kết học kỳ I về công tác giáo dục và đào tạo' },
  { key: 'to_trinh', label: 'Tờ trình', prefix: 'TTr', placeholder: 'Tờ trình xin cấp kinh phí sửa chữa phòng thực hành bộ môn Tin học' },
  { key: 'bien_ban', label: 'Biên bản', prefix: 'BB', placeholder: 'Biên bản họp Hội đồng sư phạm đánh giá thi đua tháng 10' },
  { key: 'giay_moi', label: 'Giấy mời', prefix: 'GM', placeholder: 'Giấy mời tham dự Hội nghị đại biểu Cha mẹ học sinh đầu năm' },
  { key: 'nghi_quyet', label: 'Nghị quyết', prefix: 'NQ', placeholder: 'Nghị quyết Hội nghị Cán bộ, Viên chức năm học 2026 - 2027' },
  { key: 'chuong_trinh', label: 'Chương trình công tác', prefix: 'CTr', placeholder: 'Chương trình công tác trọng tâm tháng 11 - Tri ân thầy cô' },
  { key: 'ho_so_chuyen_mon', label: 'Hồ sơ chuyên môn', prefix: 'CM', placeholder: 'Quy chế chuyên môn và kế hoạch bồi dưỡng học sinh' },
  { key: 'van_ban_dang', label: 'Văn bản Đảng / Chi bộ', prefix: 'CB', placeholder: 'Nghị quyết sinh hoạt Chi bộ thường kỳ' },
  { key: 'bieu_mau_khac', label: 'Văn bản theo mẫu tự do', prefix: 'VB', placeholder: 'Soạn thảo văn bản tùy chỉnh' },
];

export const DraftingAssistantView: React.FC<DraftingAssistantViewProps> = ({
  schoolProfile,
  onSaveDocument,
  initialDocument,
}) => {
  const [selectedType, setSelectedType] = useState<DocumentCategory>(
    initialDocument?.category || 'cong_van'
  );
  const [docTitle, setDocTitle] = useState(
    initialDocument?.title || ''
  );
  const [docNumber, setDocNumber] = useState(
    initialDocument?.docNumber || ''
  );
  const [issueDate, setIssueDate] = useState(
    initialDocument?.issueDate || new Date().toLocaleDateString('vi-VN')
  );
  const [location, setLocation] = useState(
    initialDocument?.location || (schoolProfile.address ? schoolProfile.address.split(',').pop()?.trim() || '' : '')
  );
  const [subject, setSubject] = useState(
    initialDocument?.subject || ''
  );
  const [signerPosition, setSignerPosition] = useState(
    initialDocument?.signerPosition || 'HIỆU TRƯỞNG'
  );
  const [signerName, setSignerName] = useState(
    initialDocument?.signerName || schoolProfile.principalName || ''
  );
  const [recipients, setRecipients] = useState(
    initialDocument?.recipients?.join(', ') || 'Lưu: VT'
  );
  const [content, setContent] = useState(
    initialDocument?.content || ''
  );

  // AI Generation Prompts
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [selectedText, setSelectedText] = useState('');

  // Handle Generate with AI
  const handleAIGenerate = async (actionType?: string) => {
    setIsGenerating(true);
    setAiMessage('');

    try {
      const typeLabel = DOCUMENT_TYPES.find((t) => t.key === selectedType)?.label || 'Văn bản hành chính';
      let prompt = '';

      if (actionType === 'rewrite') {
        prompt = `Hãy viết lại đoạn văn bản hành chính sau đây sao cho chuẩn xác, trang trọng và đúng văn phong quản lý giáo dục:
"""${selectedText || content.slice(0, 500)}"""`;
      } else if (actionType === 'expand') {
        prompt = `Hãy mở rộng và bổ sung chi tiết các điều khoản, căn cứ và giải pháp thực hiện cho văn bản:
Loại: ${typeLabel}
Nội dung hiện tại:
"""${content}"""`;
      } else if (actionType === 'shorten') {
        prompt = `Hãy rút gọn súc tích văn bản sau, giữ nguyên các điều khoản cốt lõi và đúng thể thức:
"""${content}"""`;
      } else if (actionType === 'spell_check') {
        prompt = `Hãy rà soát toàn bộ lỗi chính tả tiếng Việt, lỗi dùng từ, lỗi câu cú trong văn bản sau và sửa đổi trực tiếp, đồng thời giữ nguyên cấu trúc:
"""${content}"""`;
      } else if (actionType === 'standardize') {
        prompt = `Hãy chuẩn hóa toàn bộ văn bản sau đây theo đúng thể thức Nghị định 30/2020/NĐ-CP của Chính phủ. Nếu thiếu căn cứ pháp lý hoặc tên cụ thể, ghi rõ [CẦN BỔ SUNG: ...]:
Tiêu đề: ${docTitle}
Nội dung:
"""${content}"""`;
      } else {
        // Initial generation from prompt
        prompt = `Bạn là Trợ lý Soạn thảo Văn thư Trường học Việt Nam (SCHOOL DOC AI).
Hãy soạn thảo một văn bản hoàn chỉnh loại: "${typeLabel}".
Yêu cầu cụ thể từ người dùng: "${promptInput || docTitle}".

Thông tin trường học:
- Tên trường: ${schoolProfile.schoolName}
- Cơ quan chủ quản: ${schoolProfile.governingBody}
- Cấp học: ${schoolProfile.schoolLevel}
- Hiệu trưởng: ${schoolProfile.principalName}
- Địa danh: ${location}

Quy tắc bắt buộc:
1. Tuân thủ tuyệt đối Nghị định 30/2020/NĐ-CP (Căn cứ pháp lý chính xác, các điều khoản rõ ràng, nơi nhận chuẩn mực).
2. Khi thiếu thông tin hoặc số liệu cụ thể, đánh dấu [CẦN BỔ SUNG: mô tả], KHÔNG được tự bịa số hiệu hoặc tên người ký.
3. Xuất ra phần thân nội dung văn bản (các căn cứ và Điều 1, Điều 2... hoặc mục I, II, III).`;
      }

      const res = await apiService.generateText({ prompt });
      if (res.success && res.text) {
        if (actionType === 'rewrite' && selectedText) {
          setContent((prev) => prev.replace(selectedText, res.text));
        } else {
          setContent(res.text);
        }
        setAiMessage('Đã hoàn thành xử lý nội dung bằng AI.');
      } else {
        setAiMessage('Lỗi AI: ' + (res.error || 'Vui lòng kiểm tra API Key'));
      }
    } catch (err: any) {
      setAiMessage('Lỗi: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Save
  const handleSave = () => {
    const doc: AdministrativeDocument = {
      id: initialDocument?.id || 'doc_' + Date.now(),
      title: docTitle,
      category: selectedType,
      docNumber,
      issueDate,
      location,
      subject,
      signerName,
      signerPosition,
      recipients: recipients.split(';').map((r) => r.trim()).filter(Boolean),
      content,
      status: initialDocument?.status || 'draft',
      createdAt: initialDocument?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: schoolProfile.principalName || 'Cán bộ văn thư',
    };
    onSaveDocument(doc);
    alert('Đã lưu văn bản vào hệ thống hồ sơ số thành công!');
  };

  // Handle Export Word DOCX
  const handleExportDocx = async () => {
    const doc: AdministrativeDocument = {
      id: 'temp',
      title: docTitle,
      category: selectedType,
      docNumber,
      issueDate,
      location,
      subject,
      signerName,
      signerPosition,
      recipients: recipients.split(';').map((r) => r.trim()).filter(Boolean),
      content,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: signerName,
    };

    try {
      const blob = await generateAdminDocx(doc, schoolProfile);
      const safeFilename = `${docNumber ? docNumber.replace(/[/\\?%*:|"<>]/g, '_') : 'Van_Ban'}.docx`;
      downloadFile(blob, safeFilename);
    } catch (err: any) {
      alert('Lỗi tạo file Word: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Document Type Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Loại văn bản (NĐ 30):
          </label>
          <select
            value={selectedType}
            onChange={(e) => {
              const val = e.target.value as DocumentCategory;
              setSelectedType(val);
              const found = DOCUMENT_TYPES.find((t) => t.key === val);
              if (found) {
                setDocNumber(`…/${found.prefix}-${schoolProfile.schoolCode ? schoolProfile.schoolCode.split('-')[1] : 'THCS'}`);
              }
            }}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-medium text-slate-800 focus:outline-blue-500"
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu hồ sơ</span>
          </button>
          <button
            onClick={handleExportDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            title="Tải văn bản Microsoft Word (.docx) chuẩn Nghị định 30"
          >
            <Download className="w-4 h-4" />
            <span>Xuất file Word (.docx)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: AI Assistant Panel (Left) & Live A4 Paper Simulation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Prompt & Refinement Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* AI Drafting Prompt Box */}
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Soạn thảo bằng ngôn ngữ tự nhiên</span>
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">
                Gemini 3.8
              </span>
            </div>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ví dụ: Soạn quyết định phân công nhiệm vụ cho 5 tổ trưởng chuyên môn và các giáo viên chủ nhiệm khối 9 năm học mới..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-blue-500 h-28 resize-none bg-slate-50/50"
            />
            <button
              onClick={() => handleAIGenerate()}
              disabled={isGenerating}
              className="w-full py-2 px-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang soạn thảo theo Nghị định 30...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Tạo nội dung tự động</span>
                </>
              )}
            </button>
          </div>

          {/* AI Surgical Editing Tools */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>Công cụ AI tinh chỉnh văn bản</span>
            </span>
            <p className="text-[11px] text-slate-500">
              Chọn một đoạn trong vùng soạn thảo bên phải để áp dụng, hoặc áp dụng cho toàn bộ văn bản:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleAIGenerate('standardize')}
                disabled={isGenerating}
                className="p-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-left transition-colors font-medium text-slate-700 flex flex-col gap-1 cursor-pointer"
              >
                <span className="font-semibold text-blue-700 text-[11px]">Chuẩn hóa NĐ 30</span>
                <span className="text-[10px] text-slate-500">Bổ sung căn cứ & điều khoản</span>
              </button>

              <button
                onClick={() => handleAIGenerate('spell_check')}
                disabled={isGenerating}
                className="p-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-left transition-colors font-medium text-slate-700 flex flex-col gap-1 cursor-pointer"
              >
                <span className="font-semibold text-emerald-700 text-[11px]">Kiểm tra chính tả</span>
                <span className="text-[10px] text-slate-500">Rà soát dấu & ngữ pháp tiếng Việt</span>
              </button>

              <button
                onClick={() => handleAIGenerate('expand')}
                disabled={isGenerating}
                className="p-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-left transition-colors font-medium text-slate-700 flex flex-col gap-1 cursor-pointer"
              >
                <span className="font-semibold text-indigo-700 text-[11px]">Mở rộng nội dung</span>
                <span className="text-[10px] text-slate-500">Viết chi tiết các biện pháp</span>
              </button>

              <button
                onClick={() => handleAIGenerate('shorten')}
                disabled={isGenerating}
                className="p-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-left transition-colors font-medium text-slate-700 flex flex-col gap-1 cursor-pointer"
              >
                <span className="font-semibold text-purple-700 text-[11px]">Rút gọn súc tích</span>
                <span className="text-[10px] text-slate-500">Tối ưu dung lượng báo cáo</span>
              </button>
            </div>

            {aiMessage && (
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
                {aiMessage}
              </div>
            )}
          </div>

          {/* Guidelines Mini Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] space-y-2 text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quy tắc chuẩn Nghị định 30/2020:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Khổ giấy A4 (210 x 297 mm), lề trái 30mm, lề trên/dưới 20mm, lề phải 15mm.</li>
              <li>Phông chữ Times New Roman bộ mã Unicode.</li>
              <li>Số ký hiệu: [Số]/[Tên loại]-[Cơ quan] (Ví dụ: 142/QĐ-THCSND).</li>
              <li>Các mục chưa có số liệu được đánh dấu [CẦN BỔ SUNG].</li>
            </ul>
          </div>
        </div>

        {/* Right: Live A4 Document Editor (8 cols) */}
        <div className="lg:col-span-8 bg-slate-200/70 p-4 md:p-6 rounded-2xl border border-slate-300 shadow-inner flex justify-center overflow-x-auto">
          {/* Simulated A4 Sheet */}
          <div className="w-full max-w-[800px] bg-white min-h-[1050px] shadow-2xl p-8 md:p-12 text-slate-900 font-serif leading-relaxed flex flex-col justify-between border border-slate-300/60">
            {/* 1. Header (2 Columns) */}
            <div className="grid grid-cols-12 gap-2 text-xs border-b pb-4 border-slate-200">
              {/* Left Column */}
              <div className="col-span-5 text-center space-y-1">
                <input
                  type="text"
                  value={schoolProfile.governingBody}
                  readOnly
                  className="w-full text-center font-normal uppercase text-[11px] bg-transparent outline-hidden"
                />
                <input
                  type="text"
                  value={schoolProfile.schoolName}
                  readOnly
                  className="w-full text-center font-bold uppercase text-[11px] bg-transparent outline-hidden"
                />
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-[11px]">Số:</span>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="font-medium text-center text-[11px] bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 focus:bg-white"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="col-span-7 text-center space-y-0.5">
                <div className="font-bold text-[11px] uppercase tracking-tight">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="font-bold text-xs underline decoration-1 underline-offset-4">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="text-[11px] italic pt-1 flex items-center justify-center gap-1">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="text-right w-24 bg-transparent outline-hidden"
                  />
                  <span>, ngày</span>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="text-center w-24 bg-slate-50 border border-slate-300 rounded px-1 py-0.5"
                  />
                </div>
              </div>
            </div>

            {/* 2. Document Title & Subject */}
            <div className="py-6 text-center space-y-2">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="TIÊU ĐỀ VĂN BẢN (IN HOA)"
                className="w-full text-center font-bold text-base md:text-lg uppercase tracking-tight bg-transparent focus:bg-slate-50 rounded p-1 outline-hidden"
              />
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold italic">Trích yếu:</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="V/v..."
                  className="w-3/4 text-center font-medium italic text-xs bg-transparent focus:bg-slate-50 rounded p-1 outline-hidden border-b border-transparent focus:border-slate-300"
                />
              </div>
            </div>

            {/* 3. Document Body Content (Editable Textarea) */}
            <div className="flex-1 py-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  setSelectedText(target.value.substring(target.selectionStart, target.selectionEnd));
                }}
                className="w-full h-full min-h-[420px] text-xs md:text-sm text-justify leading-relaxed p-2 bg-transparent focus:bg-slate-50/50 rounded resize-none outline-hidden font-serif border border-transparent focus:border-slate-200"
                placeholder="Nhập nội dung văn bản hành chính tại đây..."
              />
            </div>

            {/* 4. Sign-off block (2 Columns) */}
            <div className="grid grid-cols-12 gap-4 pt-6 border-t border-slate-200 text-xs">
              {/* Left: Recipients */}
              <div className="col-span-5 space-y-1">
                <div className="font-bold italic text-[11px]">Nơi nhận:</div>
                <textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  rows={4}
                  className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded resize-none outline-hidden"
                  placeholder="Ngăn cách bằng dấu chấm phẩy (;)"
                />
              </div>

              {/* Right: Authority & Signature */}
              <div className="col-span-7 text-center space-y-1">
                <input
                  type="text"
                  value={signerPosition}
                  onChange={(e) => setSignerPosition(e.target.value)}
                  className="w-full text-center font-bold text-xs uppercase bg-transparent outline-hidden"
                />
                <div className="h-20 flex items-center justify-center text-slate-300 italic text-[11px]">
                  (Chữ ký, đóng dấu)
                </div>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded p-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
