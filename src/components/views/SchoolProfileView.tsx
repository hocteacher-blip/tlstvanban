import React, { useState } from 'react';
import {
  Building2,
  Save,
  Users,
  Upload,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import { SchoolProfile, TeacherStaff } from '../../types';
import { parseExcelFile, exportToExcel } from '../../utils/excelProcessor';

interface SchoolProfileViewProps {
  schoolProfile: SchoolProfile;
  onSaveProfile: (profile: SchoolProfile) => void;
}

export const SchoolProfileView: React.FC<SchoolProfileViewProps> = ({
  schoolProfile,
  onSaveProfile,
}) => {
  const [profile, setProfile] = useState<SchoolProfile>(schoolProfile);
  const [activeTab, setActiveTab] = useState<'info' | 'staff'>('info');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newStaff, setNewStaff] = useState<Partial<TeacherStaff>>({
    code: '',
    fullName: '',
    birthDate: '',
    gender: 'Nữ',
    department: 'Tổ Toán - Tin học',
    position: 'Giáo viên',
    phone: '',
    email: '',
    degree: 'Đại học Sư phạm',
    status: 'Đang công tác',
  });

  const handleSaveAll = () => {
    onSaveProfile(profile);
    alert('Đã lưu thông tin Hồ sơ đơn vị dùng chung thành công!');
  };

  const handleAddStaff = () => {
    if (!newStaff.fullName) {
      alert('Vui lòng nhập họ tên cán bộ, giáo viên!');
      return;
    }
    const staffItem: TeacherStaff = {
      id: 'staff_' + Date.now(),
      code: newStaff.code || `CB${profile.staffList.length + 1}`,
      fullName: newStaff.fullName,
      birthDate: newStaff.birthDate || '',
      gender: (newStaff.gender as any) || 'Nữ',
      department: newStaff.department || 'Tổ Chuyên môn',
      position: newStaff.position || 'Giáo viên',
      phone: newStaff.phone || '',
      email: newStaff.email || '',
      degree: newStaff.degree || 'Đại học',
      status: 'Đang công tác',
    };
    setProfile({
      ...profile,
      staffList: [...profile.staffList, staffItem],
    });
    setShowAddModal(false);
    setNewStaff({
      code: '',
      fullName: '',
      birthDate: '',
      gender: 'Nữ',
      department: 'Tổ Toán - Tin học',
      position: 'Giáo viên',
      phone: '',
      email: '',
      degree: 'Đại học Sư phạm',
      status: 'Đang công tác',
    });
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa cán bộ này khỏi danh sách?')) {
      setProfile({
        ...profile,
        staffList: profile.staffList.filter((s) => s.id !== id),
      });
    }
  };

  const handleImportStaffExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const parsed = parseExcelFile(buffer);
        const importedStaff: TeacherStaff[] = parsed.rows.map((r, idx) => ({
          id: 'staff_' + Date.now() + '_' + idx,
          code: String(r['Mã CB'] || r['Mã'] || `CB${idx + 1}`),
          fullName: String(r['Họ tên'] || r['Họ và tên'] || 'Chưa rõ'),
          birthDate: String(r['Ngày sinh'] || ''),
          gender: String(r['Giới tính'] || 'Nữ') as any,
          department: String(r['Tổ chuyên môn'] || r['Phòng ban'] || 'Tổ Chuyên môn'),
          position: String(r['Chức vụ'] || 'Giáo viên'),
          phone: String(r['Điện thoại'] || ''),
          email: String(r['Email'] || ''),
          degree: String(r['Trình độ'] || 'Đại học'),
          status: 'Đang công tác',
        }));

        setProfile((prev) => ({
          ...prev,
          staffList: [...prev.staffList, ...importedStaff],
        }));
        alert(`Đã nhập thành công ${importedStaff.length} cán bộ, giáo viên từ Excel!`);
      } catch (err: any) {
        alert('Lỗi nhập Excel: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportStaffExcel = () => {
    const exportData = profile.staffList.map((s, idx) => ({
      'STT': idx + 1,
      'Mã CB': s.code,
      'Họ và tên': s.fullName,
      'Ngày sinh': s.birthDate,
      'Giới tính': s.gender,
      'Tổ chuyên môn': s.department,
      'Chức vụ': s.position,
      'Trình độ': s.degree,
      'Điện thoại': s.phone,
      'Email': s.email,
      'Trạng thái': s.status,
    }));
    exportToExcel(exportData, `Danh_sach_CB_GV_${profile.schoolCode || 'Truong'}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-1">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Thông tin dùng chung toàn trường</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Hồ sơ đơn vị & Danh bạ Cán bộ, Giáo viên
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Khai báo thông tin đơn vị một lần duy nhất. AI sẽ tự động điền tên trường, cơ quan chủ quản, hiệu trưởng và danh sách giáo viên vào mọi văn bản.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Lưu thông tin hồ sơ</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Thông tin trường học & Người ký</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh bạ Cán bộ - Giáo viên - Nhân viên ({profile.staffList.length})</span>
        </button>
      </div>

      {/* TAB 1: School Info & Signers */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Info Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2 border-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Thông tin hành chính đơn vị</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Tên cơ quan quản lý cấp trên:</label>
                <input
                  type="text"
                  value={profile.governingBody}
                  onChange={(e) => setProfile({ ...profile, governingBody: e.target.value })}
                  placeholder="PHÒNG GIÁO DỤC VÀ ĐÀO TẠO..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 mt-1 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Tên chính thức trường học:</label>
                <input
                  type="text"
                  value={profile.schoolName}
                  onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
                  placeholder="TRƯỜNG THCS NGUYỄN DU"
                  className="w-full p-2.5 rounded-lg border border-slate-300 mt-1 bg-slate-50 focus:bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Mã định danh trường:</label>
                  <input
                    type="text"
                    value={profile.schoolCode}
                    onChange={(e) => setProfile({ ...profile, schoolCode: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 mt-1 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Cấp học:</label>
                  <select
                    value={profile.schoolLevel}
                    onChange={(e) => setProfile({ ...profile, schoolLevel: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-slate-300 mt-1 bg-slate-50"
                  >
                    <option value="Tiểu học">Tiểu học</option>
                    <option value="THCS">THCS</option>
                    <option value="Liên cấp TH & THCS">Liên cấp TH & THCS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Địa chỉ trường:</label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 mt-1 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Số điện thoại:</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 mt-1 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Hòm thư điện tử (Email):</label>
                  <input
                    type="text"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 mt-1 bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Leaders & Signers Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2 border-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Lãnh đạo đơn vị & Thẩm quyền ký</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Hiệu trưởng (Người ký chính):</label>
                <input
                  type="text"
                  value={profile.principalName}
                  onChange={(e) => setProfile({ ...profile, principalName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 mt-1 bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Phó Hiệu trưởng phụ trách chuyên môn:</label>
                <input
                  type="text"
                  value={profile.vicePrincipalName}
                  onChange={(e) => setProfile({ ...profile, vicePrincipalName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 mt-1 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Chủ tịch Công đoàn cơ sở:</label>
                <input
                  type="text"
                  value={profile.unionLeaderName}
                  onChange={(e) => setProfile({ ...profile, unionLeaderName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 mt-1 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Bí thư Chi bộ nhà trường:</label>
                <input
                  type="text"
                  value={profile.partySecretaryName}
                  onChange={(e) => setProfile({ ...profile, partySecretaryName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 mt-1 bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Staff Directory Table */}
      {activeTab === 'staff' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Danh sách Cán bộ, Giáo viên, Nhân viên ({profile.staffList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Dữ liệu được dùng cho việc phân công chuyên môn, lập giấy mời và đánh giá xếp loại.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Nhập từ Excel</span>
                <input type="file" accept=".xlsx,.xls" onChange={handleImportStaffExcel} className="hidden" />
              </label>

              <button
                onClick={handleExportStaffExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm nhân sự</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Mã CB</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Ngày sinh</th>
                  <th className="py-2.5 px-3">Giới tính</th>
                  <th className="py-2.5 px-3">Tổ chuyên môn</th>
                  <th className="py-2.5 px-3">Chức vụ</th>
                  <th className="py-2.5 px-3">Trình độ</th>
                  <th className="py-2.5 px-3">Điện thoại</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profile.staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-blue-600 font-semibold">{s.code}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{s.fullName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.birthDate}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.gender}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{s.department}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.position}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.degree}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.phone}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteStaff(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Thêm cán bộ / giáo viên mới</h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Mã cán bộ:</label>
                  <input
                    type="text"
                    value={newStaff.code}
                    onChange={(e) => setNewStaff({ ...newStaff, code: e.target.value })}
                    placeholder="GV03"
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Giới tính:</label>
                  <select
                    value={newStaff.gender}
                    onChange={(e) => setNewStaff({ ...newStaff, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Họ và tên:</label>
                <input
                  type="text"
                  value={newStaff.fullName}
                  onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                  placeholder="Nhập họ và tên..."
                  className="w-full p-2 border border-slate-300 rounded mt-1 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Ngày sinh:</label>
                  <input
                    type="text"
                    value={newStaff.birthDate}
                    onChange={(e) => setNewStaff({ ...newStaff, birthDate: e.target.value })}
                    placeholder="dd/mm/yyyy"
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Chức vụ:</label>
                  <input
                    type="text"
                    value={newStaff.position}
                    onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                    placeholder="Giáo viên"
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Tổ chuyên môn:</label>
                <input
                  type="text"
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  placeholder="Tổ Toán - Tin học"
                  className="w-full p-2 border border-slate-300 rounded mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Điện thoại:</label>
                  <input
                    type="text"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="0912..."
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Trình độ:</label>
                  <input
                    type="text"
                    value={newStaff.degree}
                    onChange={(e) => setNewStaff({ ...newStaff, degree: e.target.value })}
                    placeholder="Đại học Sư phạm"
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleAddStaff}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
              >
                Lưu nhân sự
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
