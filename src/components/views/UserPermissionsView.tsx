import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  History,
  KeyRound,
  User,
  Shield,
  Edit3,
  Check,
} from 'lucide-react';
import { UserAccount, UserRole, Permission, AuditLogItem } from '../../types';
import { AVAILABLE_ROLES } from '../../services/db';

interface UserPermissionsViewProps {
  currentUser: UserAccount;
  onSwitchUser: (user: UserAccount) => void;
  auditLogs: AuditLogItem[];
}

export const UserPermissionsView: React.FC<UserPermissionsViewProps> = ({
  currentUser,
  onSwitchUser,
  auditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'logs'>('matrix');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editDepartment, setEditDepartment] = useState(currentUser.department);

  // Role permissions definitions
  const rolePermissions: Record<UserRole, Permission> = {
    admin: { canView: true, canCreate: true, canEdit: true, canApprove: true, canDelete: true, canExport: true },
    principal: { canView: true, canCreate: true, canEdit: true, canApprove: true, canDelete: true, canExport: true },
    vice_principal: { canView: true, canCreate: true, canEdit: true, canApprove: true, canDelete: false, canExport: true },
    clerk: { canView: true, canCreate: true, canEdit: true, canApprove: false, canDelete: false, canExport: true },
    subject_head: { canView: true, canCreate: true, canEdit: true, canApprove: false, canDelete: false, canExport: true },
    teacher: { canView: true, canCreate: true, canEdit: false, canApprove: false, canDelete: false, canExport: true },
    staff: { canView: true, canCreate: true, canEdit: false, canApprove: false, canDelete: false, canExport: true },
  };

  const handleSaveProfile = () => {
    if (editName.trim()) {
      onSwitchUser({
        ...currentUser,
        name: editName.trim(),
        department: editDepartment.trim() || 'Ban Giám hiệu',
      });
    }
    setIsEditingProfile(false);
  };

  const handleRoleChange = (role: UserRole) => {
    onSwitchUser({
      ...currentUser,
      role,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kiểm soát phân quyền & Bảo mật (RBAC)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tài khoản người dùng & Phân quyền 7 vai trò nhà trường
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân định rõ ràng quyền hạn: Xem, Tạo, Chỉnh sửa, Phê duyệt, Xóa và Xuất dữ liệu giữa Hiệu trưởng, Phó Hiệu trưởng, Văn thư, Tổ trưởng và Giáo viên.
          </p>
        </div>
      </div>

      {/* User Account & Operational Role Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditingProfile ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="p-1.5 text-xs border border-blue-400 rounded w-48 font-semibold"
                    placeholder="Họ tên người dùng"
                  />
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="p-1.5 text-xs border border-slate-300 rounded w-40 text-slate-600"
                    placeholder="Phòng ban / Tổ"
                  />
                  <button
                    onClick={handleSaveProfile}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold flex items-center gap-1 hover:bg-blue-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
                    <button
                      onClick={() => {
                        setEditName(currentUser.name);
                        setEditDepartment(currentUser.department);
                        setIsEditingProfile(true);
                      }}
                      className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                      title="Chỉnh sửa thông tin tài khoản"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{currentUser.email}</span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium">{currentUser.department}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Vai trò đang áp dụng:</span>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {AVAILABLE_ROLES.find((r) => r.role === currentUser.role)?.title || currentUser.role}
              </span>
            </span>
          </div>
        </div>

        {/* Role Selector Grid */}
        <div>
          <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" />
            <span>Thiết lập vai trò tác nghiệp của bạn trong hệ thống:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {AVAILABLE_ROLES.map(({ role, title, desc }) => {
              const isActive = currentUser.role === role;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{title}</span>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'matrix'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Ma trận phân quyền (7 vai trò)</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Nhật ký kiểm toán hệ thống ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Permission Matrix Table */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vai trò trường học</th>
                  <th className="py-3 px-3 text-center">Xem văn bản</th>
                  <th className="py-3 px-3 text-center">Soạn thảo mới</th>
                  <th className="py-3 px-3 text-center">Chỉnh sửa</th>
                  <th className="py-3 px-3 text-center">Phê duyệt / Ký</th>
                  <th className="py-3 px-3 text-center">Xóa hồ sơ</th>
                  <th className="py-3 px-3 text-center">Xuất DOCX/Excel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {AVAILABLE_ROLES.map(({ role, title }) => {
                  const perm = rolePermissions[role];
                  const isCurrent = currentUser.role === role;
                  return (
                    <tr key={role} className={isCurrent ? 'bg-blue-50/50 font-semibold' : 'hover:bg-slate-50'}>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="text-slate-900">{title}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                            Vai trò đang chọn
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perm.canView ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perm.canCreate ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perm.canEdit ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perm.canApprove ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perm.canDelete ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {perm.canExport ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-3">Người thực hiện</th>
                  <th className="py-3 px-3">Vai trò</th>
                  <th className="py-3 px-3">Hành động</th>
                  <th className="py-3 px-4">Chi tiết thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Chưa có nhật ký hoạt động nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{log.timestamp}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{log.userName}</td>
                      <td className="py-3 px-3">
                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium text-[11px]">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{log.action}</td>
                      <td className="py-3 px-4 text-slate-600">{log.detail}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
