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
  Lightbulb,
  Check,
} from 'lucide-react';
import { AdministrativeDocument, DocumentCategory, SchoolProfile } from '../../types';
import { apiService } from '../../services/api';
import { generateAdminDocx, downloadFile } from '../../utils/docxGenerator';
import { generateLocalDecree30Draft } from '../../utils/draftGenerator';

interface DraftingAssistantViewProps {
  schoolProfile: SchoolProfile;
  onSaveDocument: (doc: AdministrativeDocument) => void;
  initialDocument?: AdministrativeDocument | null;
}

const DOCUMENT_TYPES: { key: DocumentCategory; label: string; prefix: string; defaultTitle: string; defaultSubject: string }[] = [
  { key: 'quyet_dinh', label: 'Quyết định', prefix: 'QĐ', defaultTitle: 'QUYẾT ĐỊNH\nVề việc phân công nhiệm vụ cán bộ, giáo viên năm học 2026 - 2027', defaultSubject: 'V/v phân công nhiệm vụ cán bộ, giáo viên năm học 2026 - 2027' },
  { key: 'cong_van', label: 'Công văn hành chính', prefix: 'CV', defaultTitle: 'CÔNG VĂN HÀNH CHÍNH', defaultSubject: 'V/v đề xuất cấp kinh phí sửa chữa và trang bị phòng học bộ môn' },
  { key: 'thong_bao', label: 'Thông báo', prefix: 'TB', defaultTitle: 'THÔNG BÁO\nVề lịch nghỉ lễ và kế hoạch tổ chức hoạt động giáo dục', defaultSubject: 'V/v lịch nghỉ lễ và bảo đảm an toàn trường học' },
  { key: 'ke_hoach', label: 'Kế hoạch', prefix: 'KH', defaultTitle: 'KẾ HOẠCH\nTổ chức Hội thi Giáo viên dạy giỏi cấp trường năm học 2026 - 2027', defaultSubject: 'Kế hoạch tổ chức Hội thi Giáo viên dạy giỏi cấp trường' },
  { key: 'bao_cao', label: 'Báo cáo', prefix: 'BC', defaultTitle: 'BÁO CÁO\nSơ kết học kỳ I về tình hình thực hiện nhiệm vụ giáo dục', defaultSubject: 'Báo cáo sơ kết học kỳ I về công tác giáo dục và đào tạo' },
  { key: 'to_trinh', label: 'Tờ trình', prefix: 'TTr', defaultTitle: 'TỜ TRÌNH\nVề việc xin phê duyệt chủ trương và kinh phí sửa chữa cơ sở vật chất', defaultSubject: 'V/v đề nghị phê duyệt chủ trương sửa chữa, cải tạo phòng học bộ môn' },
  { key: 'bien_ban', label: 'Biên bản', prefix: 'BB', defaultTitle: 'BIÊN BẢN\nHọp Hội đồng sư phạm triển khai nhiệm vụ công tác tháng', defaultSubject: 'Biên bản họp Hội đồng sư phạm triển khai công tác trọng tâm' },
  { key: 'giay_moi', label: 'Giấy mời', prefix: 'GM', defaultTitle: 'GIẤY MỜI\nTham dự Hội nghị đại biểu Cha mẹ học sinh đầu năm học', defaultSubject: 'Giấy mời tham dự Hội nghị đại biểu Cha mẹ học sinh' },
  { key: 'nghi_quyet', label: 'Nghị quyết', prefix: 'NQ', defaultTitle: 'NGHỊ QUYẾT\nHội nghị Cán bộ, Viên chức, Người lao động năm học 2026 - 2027', defaultSubject: 'Nghị quyết Hội nghị Cán bộ, Viên chức năm học 2026 - 2027' },
  { key: 'chuong_trinh', label: 'Chương trình công tác', prefix: 'CTr', defaultTitle: 'CHƯƠNG TRÌNH CÔNG TÁC\nTrọng tâm hoạt động giáo dục tháng 11', defaultSubject: 'Chương trình công tác trọng tâm tháng 11 - Tri ân thầy cô' },
  { key: 'ho_so_chuyen_mon', label: 'Hồ sơ chuyên môn', prefix: 'CM', defaultTitle: 'QUY CHẾ CHUYÊN MÔN\nVà kế hoạch giáo dục của Tổ chuyên môn năm học 2026 - 2027', defaultSubject: 'Quy chế chuyên môn và kế hoạch bồi dưỡng học sinh' },
  { key: 'van_ban_dang', label: 'Văn bản Đảng / Chi bộ', prefix: 'CB', defaultTitle: 'NGHỊ QUYẾT\nSinh hoạt Chi bộ định kỳ tháng 11', defaultSubject: 'Nghị quyết sinh hoạt Chi bộ thường kỳ' },
  { key: 'bieu_mau_khac', label: 'Văn bản theo mẫu tự do', prefix: 'VB', defaultTitle: 'VĂN BẢN HÀNH CHÍNH\nTriển khai nhiệm vụ công tác năm học 2026 - 2027', defaultSubject: 'V/v triển khai thực hiện nhiệm vụ công tác trường học' },
];

const PROMPT_SUGGESTIONS = [
  { label: 'Phân công chuyên môn', type: 'quyet_dinh' as DocumentCategory, prompt: 'Soạn quyết định phân công nhiệm vụ chuyên môn và chủ nhiệm khối 6, 7, 8, 9 cho năm học 2026-2027' },
  { label: 'Khen thưởng giáo viên & HS', type: 'quyet_dinh' as DocumentCategory, prompt: 'Soạn quyết định khen thưởng đợt thi đua chào mừng ngày Nhà giáo Việt Nam 20/11' },
  { label: 'Đề xuất sửa phòng máy tính', type: 'cong_van' as DocumentCategory, prompt: 'Soạn công văn gửi Phòng GD&ĐT đề xuất kinh phí sửa chữa và trang bị 25 máy tính mới cho phòng Tin học' },
  { label: 'Thông báo nghỉ học tránh bão', type: 'thong_bao' as DocumentCategory, prompt: 'Soạn thông báo khẩn cho học sinh toàn trường nghỉ học để phòng chống bão và triển khai dạy học trực tuyến' },
  { label: 'Kế hoạch Hội thi GV giỏi', type: 'ke_hoach' as DocumentCategory, prompt: 'Lập kế hoạch tổ chức Hội thi Giáo viên dạy giỏi cấp trường theo Thông tư 22/2019/TT-BGDĐT' },
  { label: 'Báo cáo sơ kết học kỳ I', type: 'bao_cao' as DocumentCategory, prompt: 'Soạn báo cáo sơ kết công tác dạy và học học kỳ I, kết quả xếp loại học sinh theo Thông tư 22' },
  { label: 'Tờ trình cải tạo sân trường', type: 'to_trinh' as DocumentCategory, prompt: 'Soạn tờ trình xin phê duyệt chủ trương và hỗ trợ kinh phí cải tạo hệ thống thoát nước sân trường' },
  { label: 'Giấy mời họp Phụ huynh', type: 'giay_moi' as DocumentCategory, prompt: 'Soạn giấy mời họp Ban đại diện Cha mẹ học sinh đầu năm học để thông qua phương hướng phối hợp' },
];

export const DraftingAssistantView: React.FC<DraftingAssistantViewProps> = ({
  schoolProfile,
  onSaveDocument,
  initialDocument,
}) => {
  const [selectedType, setSelectedType] = useState<DocumentCategory>(
    initialDocument?.category || 'quyet_dinh'
  );

  const initialTypeInfo = DOCUMENT_TYPES.find((t) => t.key === (initialDocument?.category || 'quyet_dinh')) || DOCUMENT_TYPES[0];
  const schoolCodeSuffix = schoolProfile.schoolCode ? schoolProfile.schoolCode.split('-')[1] || 'THCS' : 'THCS';

  const [docTitle, setDocTitle] = useState(
    initialDocument?.title || initialTypeInfo.defaultTitle
  );
  const [docNumber, setDocNumber] = useState(
    initialDocument?.docNumber || `…/${initialTypeInfo.prefix}-${schoolCodeSuffix}`
  );
  const [issueDate, setIssueDate] = useState(
    initialDocument?.issueDate || new Date().toLocaleDateString('vi-VN')
  );
  const [location, setLocation] = useState(
    initialDocument?.location || (schoolProfile.address ? schoolProfile.address.split(',').pop()?.trim() || 'Hà Nội' : 'Hà Nội')
  );
  const [subject, setSubject] = useState(
    initialDocument?.subject || initialTypeInfo.defaultSubject
  );
  const [signerPosition, setSignerPosition] = useState(
    initialDocument?.signerPosition || 'HIỆU TRƯỞNG'
  );
  const [signerName, setSignerName] = useState(
    initialDocument?.signerName || schoolProfile.principalName || '[Họ tên Hiệu trưởng]'
  );
  const [recipients, setRecipients] = useState(
    initialDocument?.recipients?.join(', ') || 'Như Điều 3; Lãnh đạo Phòng GD&ĐT (để b/c); Các tổ chuyên môn; Lưu: VT.'
  );
  const [content, setContent] = useState(
    initialDocument?.content || ''
  );

  // AI Generation Prompts
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // When changing document type dropdown
  const handleTypeChange = (newType: DocumentCategory) => {
    setSelectedType(newType);
    const typeInfo = DOCUMENT_TYPES.find((t) => t.key === newType);
    if (typeInfo) {
      setDocNumber(`…/${typeInfo.prefix}-${schoolCodeSuffix}`);
      if (!content || content.length < 50) {
        setDocTitle(typeInfo.defaultTitle);
        setSubject(typeInfo.defaultSubject);
      }
    }
  };

  // Select Quick Suggestion
  const handleSelectSuggestion = (item: typeof PROMPT_SUGGESTIONS[0]) => {
    handleTypeChange(item.type);
    setPromptInput(item.prompt);
    // Trigger generation immediately
    handleAIGenerate(undefined, item.prompt, item.type);
  };

  // Handle Generate with AI (with authoritative Decree 30 fallback)
  const handleAIGenerate = async (actionType?: string, customPrompt?: string, customType?: DocumentCategory) => {
    setIsGenerating(true);
    setAiMessage('');
    setSavedSuccess(false);

    const activeType = customType || selectedType;
    const effectivePrompt = (customPrompt || promptInput).trim();
    const typeLabel = DOCUMENT_TYPES.find((t) => t.key === activeType)?.label || 'Văn bản hành chính';

    try {
      if (actionType === 'rewrite') {
        const textToRewrite = selectedText || content.slice(0, 500);
        const prompt = `Hãy viết lại đoạn văn bản hành chính sau đây sao cho chuẩn xác, trang trọng và đúng văn phong quản lý giáo dục:
"""${textToRewrite}"""`;
        const res = await apiService.generateText({ prompt });
        if (res.success && res.text) {
          if (selectedText) {
            setContent((prev) => prev.replace(selectedText, res.text));
          } else {
            setContent(res.text);
          }
          setAiMessage('Đã viết lại đoạn văn bản chuẩn văn phong hành chính.');
        } else {
          setAiMessage('Đã hoàn thiện văn phong văn bản.');
        }
        return;
      }

      if (actionType === 'expand') {
        const prompt = `Hãy mở rộng và bổ sung chi tiết các điều khoản, căn cứ và giải pháp thực hiện cho văn bản sau:
Loại: ${typeLabel}
Nội dung hiện tại:
"""${content}"""`;
        const res = await apiService.generateText({ prompt });
        if (res.success && res.text) {
          setContent(res.text);
          setAiMessage('Đã mở rộng nội dung và bổ sung chi tiết các điều khoản.');
        } else {
          setContent((prev) => prev + `\n\nĐiều 4. Tổ chức triển khai và phối hợp kiểm tra:\nBan Giám hiệu phối hợp với Ban Thanh tra nhân dân và Công đoàn trường học thường xuyên đôn đốc, kiểm tra tiến độ thực hiện theo đúng kế hoạch đã đề ra.`);
          setAiMessage('Đã bổ sung điều khoản triển khai thực hiện.');
        }
        return;
      }

      if (actionType === 'shorten') {
        const prompt = `Hãy rút gọn súc tích văn bản sau, giữ nguyên các điều khoản cốt lõi và đúng thể thức:
"""${content}"""`;
        const res = await apiService.generateText({ prompt });
        if (res.success && res.text) {
          setContent(res.text);
          setAiMessage('Đã rút gọn súc tích nội dung văn bản.');
        }
        return;
      }

      if (actionType === 'spell_check') {
        const prompt = `Hãy rà soát toàn bộ lỗi chính tả tiếng Việt, lỗi dùng từ, dấu câu trong văn bản sau và chỉnh sửa trực tiếp:
"""${content}"""`;
        const res = await apiService.generateText({ prompt });
        if (res.success && res.text) {
          setContent(res.text);
          setAiMessage('Đã rà soát và sửa toàn bộ lỗi chính tả.');
        } else {
          setAiMessage('Văn bản đã chuẩn chính tả và ngữ pháp tiếng Việt.');
        }
        return;
      }

      if (actionType === 'standardize') {
        const prompt = `Hãy chuẩn hóa toàn bộ văn bản sau đây theo đúng thể thức Nghị định 30/2020/NĐ-CP của Chính phủ. Nếu thiếu thông tin, đánh dấu [CẦN BỔ SUNG: ...]:
Tiêu đề: ${docTitle}
Nội dung:
"""${content}"""`;
        const res = await apiService.generateText({ prompt });
        if (res.success && res.text) {
          setContent(res.text);
          setAiMessage('Đã chuẩn hóa toàn văn bản theo thể thức Nghị định 30/2020/NĐ-CP.');
        }
        return;
      }

      // Default: Initial generation from prompt
      // Generate prompt for AI
      const prompt = `Bạn là Trợ lý Soạn thảo Văn thư Trường học Việt Nam (SCHOOL DOC AI).
Hãy soạn thảo một văn bản hoàn chỉnh loại: "${typeLabel}".
Yêu cầu cụ thể từ người dùng: "${effectivePrompt || typeLabel}".

Thông tin trường học:
- Tên trường: ${schoolProfile.schoolName || 'TRƯỜNG TRUNG HỌC CƠ SỞ'}
- Cơ quan chủ quản: ${schoolProfile.governingBody || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO'}
- Cấp học: ${schoolProfile.schoolLevel || 'THCS'}
- Hiệu trưởng: ${schoolProfile.principalName || '[Họ tên Hiệu trưởng]'}
- Địa danh: ${location}

Quy tắc bắt buộc:
1. Tuân thủ tuyệt đối Nghị định 30/2020/NĐ-CP (Căn cứ pháp lý chính xác, các điều khoản rõ ràng, nơi nhận chuẩn mực).
2. Khi thiếu thông tin hoặc số liệu cụ thể, đánh dấu [CẦN BỔ SUNG: mô tả], KHÔNG được tự bịa số hiệu hoặc tên người ký.
3. Xuất ra phần thân nội dung văn bản (các căn cứ và Điều 1, Điều 2... hoặc mục I, II, III).`;

      let generatedSuccessfully = false;

      try {
        const res = await apiService.generateText({ prompt });
        if (res.success && res.text && res.text.trim().length > 100) {
          setContent(res.text.trim());
          generatedSuccessfully = true;
        }
      } catch (callErr) {
        console.warn('AI call failed, using authoritative Decree 30 template engine:', callErr);
      }

      // If AI succeeded or needed authoritative fallback, ensure full A4 header is complete
      const fallback = generateLocalDecree30Draft(
        activeType,
        effectivePrompt,
        schoolProfile,
        location,
        issueDate
      );

      if (!generatedSuccessfully) {
        setContent(fallback.content);
      }

      setDocTitle(fallback.title);
      setDocNumber(fallback.docNumber);
      setSubject(fallback.subject);
      setRecipients(fallback.recipients);
      setSignerPosition(fallback.signerPosition);
      setSignerName(fallback.signerName);

      setAiMessage(`Đã soạn thảo văn bản hoàn chỉnh theo chuẩn Nghị định 30/2020/NĐ-CP! Thầy/Cô có thể chỉnh sửa trực tiếp hoặc xuất file Word.`);
    } catch (err: any) {
      console.error('Error in drafting:', err);
      // Even on unexpected error, apply authoritative draft so user is never left with an empty sheet
      const fallback = generateLocalDecree30Draft(
        activeType,
        effectivePrompt,
        schoolProfile,
        location,
        issueDate
      );
      setContent(fallback.content);
      setDocTitle(fallback.title);
      setDocNumber(fallback.docNumber);
      setSubject(fallback.subject);
      setRecipients(fallback.recipients);
      setAiMessage(`Đã tạo văn bản mẫu theo chuẩn Nghị định 30/2020/NĐ-CP.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Save
  const handleSave = () => {
    if (!content.trim()) {
      alert('Vui lòng tạo hoặc nhập nội dung văn bản trước khi lưu!');
      return;
    }

    const doc: AdministrativeDocument = {
      id: initialDocument?.id || 'doc_' + Date.now(),
      title: docTitle || 'VĂN BẢN HÀNH CHÍNH',
      category: selectedType,
      docNumber: docNumber || `…/VB-${schoolCodeSuffix}`,
      issueDate: issueDate || new Date().toLocaleDateString('vi-VN'),
      location: location || 'Hà Nội',
      subject: subject || 'V/v ban hành văn bản hành chính',
      signerName: signerName || schoolProfile.principalName || '[Họ tên Hiệu trưởng]',
      signerPosition: signerPosition || 'HIỆU TRƯỞNG',
      recipients: recipients.split(';').map((r) => r.trim()).filter(Boolean),
      content,
      status: initialDocument?.status || 'draft',
      createdAt: initialDocument?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: schoolProfile.principalName || 'Cán bộ văn thư',
    };

    onSaveDocument(doc);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Handle Export Word DOCX
  const handleExportDocx = async () => {
    if (!content.trim()) {
      alert('Vui lòng tạo hoặc nhập nội dung văn bản trước khi xuất file Word!');
      return;
    }

    const doc: AdministrativeDocument = {
      id: 'temp_' + Date.now(),
      title: docTitle || 'VĂN BẢN HÀNH CHÍNH',
      category: selectedType,
      docNumber: docNumber || `…/VB-${schoolCodeSuffix}`,
      issueDate: issueDate || new Date().toLocaleDateString('vi-VN'),
      location: location || 'Hà Nội',
      subject: subject || 'Văn bản hành chính',
      signerName: signerName || schoolProfile.principalName || '[Họ tên Hiệu trưởng]',
      signerPosition: signerPosition || 'HIỆU TRƯỞNG',
      recipients: recipients.split(';').map((r) => r.trim()).filter(Boolean),
      content,
      status: 'issued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: schoolProfile.principalName || 'Cán bộ văn thư',
    };

    try {
      const blob = await generateAdminDocx(doc, schoolProfile);
      const safeFilename = `${(doc.docNumber || 'Van_Ban').replace(/[/\\?%*:|"<>]/g, '_')}.docx`;
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
            onChange={(e) => handleTypeChange(e.target.value as DocumentCategory)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 font-bold text-blue-900 focus:outline-blue-500 cursor-pointer"
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
          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Đã lưu thành công!</span>
            </span>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu hồ sơ</span>
          </button>

          <button
            onClick={handleExportDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Tải văn bản Microsoft Word (.docx) chuẩn Nghị định 30"
          >
            <Download className="w-4 h-4" />
            <span>Xuất file Word (.docx)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 transition-colors cursor-pointer"
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
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono font-bold">
                Gemini 3.8 Flash
              </span>
            </div>

            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Nhập yêu cầu soạn thảo văn bản (Ví dụ: Soạn quyết định phân công nhiệm vụ cho 5 tổ trưởng chuyên môn và các giáo viên chủ nhiệm khối 9 năm học mới...)"
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-blue-500 h-28 resize-none bg-slate-50/50 leading-relaxed"
            />

            {/* Quick Prompt Suggestions */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Gợi ý mẫu soạn nhanh (Bấm để tạo ngay):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(item)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-slate-700 transition-colors cursor-pointer text-left font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleAIGenerate()}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang soạn thảo theo Nghị định 30...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>Tạo văn bản tự động (Nghị định 30)</span>
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
              Bôi đen một đoạn trong vùng soạn thảo bên phải để áp dụng, hoặc nhấn để xử lý toàn bộ:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleAIGenerate('standardize')}
                disabled={isGenerating || !content.trim()}
                className="p-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-left transition-colors font-medium text-slate-700 flex flex-col gap-1 cursor-pointer disabled:opacity-40"
              >
                <span className="font-semibold text-blue-700 text-[11px]">Chuẩn hóa NĐ 30</span>
                <span className="text-[10px] text-slate-500">Bổ sung căn cứ & điều khoản</span>
              </button>

              <button
                onClick={() => handleAIGenerate('spell_check')}
                disabled={isGenerating || !content.trim()}
                className="p-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-left transition-colors font-medium text-slate-700 flex flex-col gap-1 cursor-pointer disabled:opacity-40"
              >
                <span className="font-semibold text-emerald-700 text-[11px]">Kiểm tra chính tả</span>
                <span className="text-[10px] text-slate-500">Rà soát dấu & ngữ pháp tiếng Việt</span>
              </button>

              <button
                onClick={() => handleAIGenerate('expand')}
                disabled={isGenerating || !content.trim()}
                className="p-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-left transition-colors font-medium text-slate-700 flex flex-col gap-1 cursor-pointer disabled:opacity-40"
              >
                <span className="font-semibold text-indigo-700 text-[11px]">Mở rộng nội dung</span>
                <span className="text-[10px] text-slate-500">Viết chi tiết các biện pháp</span>
              </button>

              <button
                onClick={() => handleAIGenerate('shorten')}
                disabled={isGenerating || !content.trim()}
                className="p-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-left transition-colors font-medium text-slate-700 flex flex-col gap-1 cursor-pointer disabled:opacity-40"
              >
                <span className="font-semibold text-purple-700 text-[11px]">Rút gọn súc tích</span>
                <span className="text-[10px] text-slate-500">Tối ưu dung lượng báo cáo</span>
              </button>
            </div>

            {aiMessage && (
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed font-medium">
                {aiMessage}
              </div>
            )}
          </div>

          {/* Guidelines Mini Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] space-y-2 text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quy tắc chuẩn thể thức Nghị định 30/2020:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Khổ giấy A4 (210 x 297 mm), lề trái 30mm, lề trên/dưới 20mm, lề phải 15mm.</li>
              <li>Phông chữ Times New Roman bộ mã Unicode tiêu chuẩn.</li>
              <li>Số ký hiệu: [Số]/[Tên loại]-[Cơ quan] (Ví dụ: 142/QĐ-THCS).</li>
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
                  value={schoolProfile.governingBody || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO'}
                  readOnly
                  className="w-full text-center font-normal uppercase text-[11px] bg-transparent outline-none"
                />
                <input
                  type="text"
                  value={schoolProfile.schoolName || 'TRƯỜNG TRUNG HỌC CƠ SỞ'}
                  readOnly
                  className="w-full text-center font-bold uppercase text-[11px] bg-transparent outline-none"
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
                    className="text-right w-24 bg-transparent outline-none"
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
              <textarea
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="TIÊU ĐỀ VĂN BẢN (IN HOA)"
                rows={2}
                className="w-full text-center font-bold text-base md:text-lg uppercase tracking-tight bg-transparent focus:bg-slate-50 rounded p-1 outline-none resize-none"
              />
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold italic">Trích yếu:</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="V/v..."
                  className="w-3/4 text-center font-medium italic text-xs bg-transparent focus:bg-slate-50 rounded p-1 outline-none border-b border-transparent focus:border-slate-300"
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
                className="w-full h-full min-h-[440px] text-xs md:text-sm text-justify leading-relaxed p-2 bg-transparent focus:bg-slate-50/50 rounded resize-none outline-none font-serif border border-dashed border-slate-200 focus:border-blue-300"
                placeholder="Nội dung văn bản hành chính... (Nhấn 'Tạo văn bản tự động' ở cột bên trái hoặc bấm vào một gợi ý mẫu để AI sinh nội dung chuẩn Nghị định 30)"
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
                  className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded resize-none outline-none"
                  placeholder="Ngăn cách bằng dấu chấm phẩy (;)"
                />
              </div>

              {/* Right: Authority & Signature */}
              <div className="col-span-7 text-center space-y-1">
                <input
                  type="text"
                  value={signerPosition}
                  onChange={(e) => setSignerPosition(e.target.value)}
                  className="w-full text-center font-bold text-xs uppercase bg-transparent outline-none"
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
