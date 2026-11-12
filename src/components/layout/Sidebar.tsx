import React from 'react';
import {
  LayoutDashboard,
  FileEdit,
  FileSpreadsheet,
  Files,
  ScanText,
  Mic,
  MessageSquareText,
  BookOpen,
  Building2,
  FolderSync,
  BookMarked,
  ShieldCheck,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Bot,
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavItemKey =
  | 'dashboard'
  | 'ai_assistant'
  | 'drafting'
  | 'form_filler'
  | 'batch_merge'
  | 'ocr'
  | 'meeting'
  | 'doc_qa'
  | 'school_profile'
  | 'templates'
  | 'font_converter'
  | 'dispatch'
  | 'permissions'
  | 'tools'
  | 'settings';

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  userRole,
}) => {
  const navSections = [
    {
      title: 'TỔNG QUAN',
      items: [
        { key: 'dashboard', label: 'Trang tổng quan', icon: LayoutDashboard },
        { key: 'ai_assistant', label: 'Trợ lý AI Nhà trường', icon: Bot, badge: 'COPILOT' },
      ],
    },
    {
      title: 'VĂN THƯ & SOẠN THẢO',
      items: [
        { key: 'drafting', label: '1. Soạn văn bản AI', icon: FileEdit, badge: 'NĐ 30' },
        { key: 'form_filler', label: '2. Điền biểu mẫu Word/Excel', icon: FileSpreadsheet, highlight: true },
        { key: 'batch_merge', label: '3. Tạo văn bản hàng loạt', icon: Files },
        { key: 'ocr', label: '5. Chuyển ảnh/PDF sang Word', icon: ScanText },
      ],
    },
    {
      title: 'HỘI HỌP & TRI THỨC',
      items: [
        { key: 'meeting', label: '4. Ghi âm cuộc họp AI', icon: Mic },
        { key: 'doc_qa', label: '6. Hỏi đáp tài liệu AI', icon: MessageSquareText },
        { key: 'templates', label: '8. Kho biểu mẫu nhà trường', icon: BookOpen },
      ],
    },
    {
      title: 'QUẢN TRỊ NHÀ TRƯỜNG',
      items: [
        { key: 'dispatch', label: '10. Sổ văn bản Đi – Đến', icon: BookMarked },
        { key: 'school_profile', label: '7. Hồ sơ đơn vị dùng chung', icon: Building2 },
        { key: 'permissions', label: '11. Phân quyền & Nhật ký', icon: ShieldCheck },
      ],
    },
    {
      title: 'CÔNG CỤ BỔ TRỢ',
      items: [
        { key: 'font_converter', label: '9. Chuyển đổi định dạng & Phông', icon: FolderSync },
        { key: 'tools', label: '12. Công cụ AI bổ trợ', icon: Wrench },
        { key: 'settings', label: 'Cài đặt AI & Sao lưu', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800 transition-all duration-300 select-none z-30 shrink-0 ${
        collapsed ? 'w-18' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                SCHOOL DOC <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono font-medium">AI</span>
              </span>
              <span className="text-[11px] text-slate-400 truncate">Văn bản & Quản trị hồ sơ số</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-2.5 text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1">
                {sec.title}
              </h3>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key as NavItemKey)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate text-left flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
                      {item.badge}
                    </span>
                  )}
                  {!collapsed && item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Current School Mini Badge */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="truncate">Hệ thống sẵn sàng</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            Chuẩn Nghị định 30/2020/NĐ-CP
          </div>
        </div>
      )}
    </aside>
  );
};
