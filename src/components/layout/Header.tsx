import React, { useState } from 'react';
import {
  ChevronDown,
  Building,
  Sparkles,
  FilePlus,
  CheckCircle2,
  User,
  Shield,
  Edit2,
  Check,
} from 'lucide-react';
import { UserAccount, UserRole, SchoolProfile } from '../../types';
import { AVAILABLE_ROLES } from '../../services/db';

interface HeaderProps {
  currentUser: UserAccount;
  onSwitchUser: (user: UserAccount) => void;
  schoolProfile: SchoolProfile;
  title: string;
  subtitle?: string;
  onNewDocClick: () => void;
  apiStatus: { ok: boolean; message: string };
  onRefreshHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  schoolProfile,
  title,
  subtitle,
  onNewDocClick,
  apiStatus,
  onRefreshHealth,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(currentUser.name);

  const getRoleLabel = (role: UserRole) => {
    const match = AVAILABLE_ROLES.find((r) => r.role === role);
    return match ? match.title : 'Người dùng';
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onSwitchUser({ ...currentUser, name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleRoleSelect = (role: UserRole) => {
    onSwitchUser({ ...currentUser, role });
    setShowUserDropdown(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Title & Context */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* School Name Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <Building className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate max-w-[200px]">{schoolProfile.schoolName || 'Chưa thiết lập đơn vị'}</span>
        </div>

        {/* AI Health Badge */}
        <button
          onClick={onRefreshHealth}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
            apiStatus.ok
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
          title="Kiểm tra trạng thái kết nối Gemini AI"
        >
          <Sparkles className="w-3 h-3 text-current" />
          <span className="hidden sm:inline">AI:</span>
          <span>{apiStatus.ok ? 'Sẵn sàng' : 'Cần kiểm tra'}</span>
        </button>

        {/* New Doc Quick Button */}
        <button
          onClick={onNewDocClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Soạn văn bản mới</span>
        </button>

        {/* User Account & Role Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <div className="font-semibold text-slate-900 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-blue-600 font-medium">{getRoleLabel(currentUser.role)}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Account Popover */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              {/* Profile Card Header */}
              <div className="px-4 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditingName ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            className="p-1 text-xs border border-blue-400 rounded w-32 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveName}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 truncate">{currentUser.name}</span>
                          <button
                            onClick={() => {
                              setTempName(currentUser.name);
                              setIsEditingName(true);
                            }}
                            className="text-slate-400 hover:text-blue-600 cursor-pointer"
                            title="Đổi tên hiển thị"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-100 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-600" />
                    <span>{getRoleLabel(currentUser.role)}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {currentUser.department || 'Đơn vị nhà trường'}
                  </span>
                </div>
              </div>

              {/* Role Selection */}
              <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Vai trò tác nghiệp trong phiên:</span>
              </div>

              <div className="max-h-60 overflow-y-auto px-2 py-1 space-y-0.5">
                {AVAILABLE_ROLES.map(({ role, title, desc }) => {
                  const isCurrent = currentUser.role === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 font-semibold text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="text-xs truncate">{title}</div>
                        <div className="text-[10px] text-slate-400 truncate font-normal">{desc}</div>
                      </div>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
