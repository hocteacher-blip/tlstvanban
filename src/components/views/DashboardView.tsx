import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Files,
  ScanText,
  Mic,
  MessageSquareText,
  BookMarked,
  Scale,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Eye,
  Plus,
  Sparkles,
  History,
  Bot,
} from 'lucide-react';
import { NavItemKey } from '../layout/Sidebar';
import { AdministrativeDocument, IncomingDispatch, MeetingRecord, AuditLogItem, SchoolProfile } from '../../types';
import { generateAdminDocx, downloadFile } from '../../utils/docxGenerator';

interface DashboardViewProps {
  onNavigate: (tab: NavItemKey) => void;
  documents: AdministrativeDocument[];
  incomingDispatches: IncomingDispatch[];
  meetings: MeetingRecord[];
  auditLogs: AuditLogItem[];
  schoolProfile: SchoolProfile;
  onOpenDoc: (doc: AdministrativeDocument) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  documents,
  incomingDispatches,
  meetings,
  auditLogs,
  schoolProfile,
  onOpenDoc,
}) => {
  const pendingApprovals = documents.filter((d) => d.status === 'pending').length;
  const urgentTasks = incomingDispatches.filter((d) => d.status !== 'completed').length;

  const quickActions = [
    {
      id: 'ai_assistant',
      title: 'Trợ lý AI Nhà trường (Copilot)',
      desc: 'Tư vấn NĐ 30, soạn thảo mẫu & tra cứu quy chuẩn sư phạm',
      icon: Bot,
      color: 'bg-indigo-600/10 text-indigo-700 border-indigo-200 hover:bg-indigo-600/20',
      action: () => onNavigate('ai_assistant'),
      badge: 'Trực tuyến',
    },
    {
      id: 'drafting',
      title: '1. Soạn văn bản AI',
      desc: 'Công văn, Quyết định, Kế hoạch chuẩn Nghị định 30',
      icon: FileText,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20',
      action: () => onNavigate('drafting'),
    },
    {
      id: 'form_filler',
      title: '2. Điền biểu mẫu Word/Excel',
      desc: 'Phân tích trường và tự động điền thông tin',
      icon: FileSpreadsheet,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200 hover:bg-indigo-500/20',
      action: () => onNavigate('form_filler'),
      badge: 'Trọng tâm',
    },
    {
      id: 'batch_merge',
      title: '3. Tạo văn bản hàng loạt',
      desc: 'Ghép Excel với Word (Quyết định, Giấy mời, Giấy khen)',
      icon: Files,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20',
      action: () => onNavigate('batch_merge'),
    },
    {
      id: 'ocr',
      title: '4. Chuyển PDF/Ảnh sang Word',
      desc: 'OCR tiếng Việt chính xác cao, tái tạo bảng biểu',
      icon: ScanText,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20',
      action: () => onNavigate('ocr'),
    },
    {
      id: 'meeting',
      title: '5. Ghi âm cuộc họp AI',
      desc: 'Microphone trực tiếp, tự lập biên bản họp hội đồng',
      icon: Mic,
      color: 'bg-rose-500/10 text-rose-600 border-rose-200 hover:bg-rose-500/20',
      action: () => onNavigate('meeting'),
    },
    {
      id: 'doc_qa',
      title: '6. Hỏi đáp tài liệu AI',
      desc: 'Tra cứu Thông tư, Điều lệ, trích xuất căn cứ pháp lý',
      icon: MessageSquareText,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20',
      action: () => onNavigate('doc_qa'),
    },
    {
      id: 'dispatch',
      title: '7. Quản lý hồ sơ văn bản',
      desc: 'Sổ văn bản Đi – Đến, theo dõi hạn xử lý',
      icon: BookMarked,
      color: 'bg-teal-500/10 text-teal-600 border-teal-200 hover:bg-teal-500/20',
      action: () => onNavigate('dispatch'),
    },
    {
      id: 'tools',
      title: '8. Tra cứu văn bản & Tiện ích',
      desc: 'Kiểm tra thể thức NĐ 30, đổi phông TCVN3/VNI',
      icon: Scale,
      color: 'bg-sky-500/10 text-sky-600 border-sky-200 hover:bg-sky-500/20',
      action: () => onNavigate('tools'),
    },
  ];

  const handleExportDocx = async (doc: AdministrativeDocument) => {
    try {
      const blob = await generateAdminDocx(doc, schoolProfile);
      downloadFile(blob, `${doc.docNumber ? doc.docNumber.replace(/[/\\?%*:|"<>]/g, '_') : 'Van_Ban'}.docx`);
    } catch (err) {
      alert('Lỗi xuất file Word: ' + err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner / Welcome Header */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Trợ lý AI – Văn bản thông minh – Quản trị hồ sơ số</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Chào mừng đến với SCHOOL DOC AI
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Hệ thống chuyên biệt hỗ trợ Ban giám hiệu, Văn thư, Tổ trưởng chuyên môn và Giáo viên soạn thảo văn bản hành chính đúng chuẩn Nghị định 30/2020/NĐ-CP, tự động hóa điền biểu mẫu và xử lý hồ sơ trường học.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('ai_assistant')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer border border-blue-400/30"
            >
              <Bot className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Mở Trợ lý AI Nhà trường (F2)</span>
            </button>
            <button
              onClick={() => onNavigate('drafting')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Soạn văn bản mới</span>
            </button>
          </div>
        </div>
        <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none text-white">
          <FileText className="w-64 h-64" />
        </div>
      </div>

      {/* 6 Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Văn bản đã tạo</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{documents.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Đầy đủ thể thức NĐ 30</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tổng biểu mẫu</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">12</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">12 nhóm chuyên biệt</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Văn bản Đi – Đến</span>
            <BookMarked className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {incomingDispatches.length}
          </div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Đã vào sổ văn thư số</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Cuộc họp đã ghi</span>
            <Mic className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{meetings.length}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Biên bản họp tự động</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Hồ sơ chờ duyệt</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{pendingApprovals}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Cần BGH phê duyệt</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Đang xử lý</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{urgentTasks}</div>
          <div className="text-[11px] text-orange-700 font-medium mt-1">Nhiệm vụ đến hạn</div>
        </div>
      </div>

      {/* 8 Quick Actions Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Thao tác nhanh thường dùng
          </h3>
          <span className="text-xs text-slate-500">8 phân hệ cốt lõi</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={act.action}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer relative"
              >
                {act.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {act.badge}
                  </span>
                )}
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${act.color} transition-colors`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {act.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {act.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-600">
                  <span>Mở phân hệ</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 Columns: Recent Documents & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Văn bản hành chính mới nhất</span>
            </h3>
            <button
              onClick={() => onNavigate('drafting')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Soạn thêm</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">Chưa có văn bản hành chính nào</div>
              <p className="text-xs text-slate-400 max-w-sm">
                Nhấp nút "Soạn thêm" hoặc dùng Trợ lý soạn thảo AI để tạo công văn, quyết định, kế hoạch theo chuẩn Nghị định 30.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between gap-4 group">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {doc.docNumber || 'Chưa số'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        doc.status === 'issued' ? 'bg-emerald-100 text-emerald-700' :
                        doc.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {doc.status === 'issued' ? 'Đã ban hành' : doc.status === 'approved' ? 'Đã duyệt' : 'Bản thảo'}
                      </span>
                      <span className="text-xs text-slate-400">{doc.issueDate}</span>
                    </div>
                    <h4
                      onClick={() => onOpenDoc(doc)}
                      className="text-xs font-medium text-slate-800 truncate hover:text-blue-600 cursor-pointer"
                    >
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      Người ký: {doc.signerPosition} {doc.signerName} • Soạn thảo: {doc.author}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenDoc(doc)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                      title="Xem chi tiết & chỉnh sửa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportDocx(doc)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      title="Tải file Word (.docx) chuẩn Nghị định 30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>DOCX</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit / Activity Stream (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              <span>Nhật ký hoạt động</span>
            </h3>
            <span className="text-xs text-slate-400">Gần đây</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <History className="w-8 h-8 text-slate-300" />
              <div className="text-xs font-medium text-slate-500">Chưa có nhật ký hoạt động</div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {auditLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-semibold text-slate-700">{log.userName}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="font-medium text-slate-800">{log.action}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">{log.detail}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
