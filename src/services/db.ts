import {
  SchoolProfile,
  AdministrativeDocument,
  IncomingDispatch,
  OutgoingDispatch,
  MeetingRecord,
  AuditLogItem,
  UserAccount,
  UserRole,
} from '../types';

const STORAGE_KEYS = {
  VERSION: 'schooldoc_v',
  PROFILE: 'schooldoc_profile',
  DOCUMENTS: 'schooldoc_documents',
  INCOMING: 'schooldoc_incoming',
  OUTGOING: 'schooldoc_outgoing',
  MEETINGS: 'schooldoc_meetings',
  LOGS: 'schooldoc_audit_logs',
  CURRENT_USER: 'schooldoc_current_user',
};

// Check and purge old sample data if version mismatch
if (typeof window !== 'undefined') {
  const currentVer = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (currentVer !== '3.0_clean_no_mock_users') {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.setItem(STORAGE_KEYS.VERSION, '3.0_clean_no_mock_users');
  }
}

// Clean School Profile without dummy data
export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: '',
  governingBody: '',
  schoolCode: '',
  schoolLevel: 'THCS',
  address: '',
  phone: '',
  email: '',
  website: '',
  principalName: '',
  vicePrincipalName: '',
  unionLeaderName: '',
  partySecretaryName: '',
  logoUrl: '',
  staffList: [],
};

// Clean empty lists
export const DEFAULT_DOCUMENTS: AdministrativeDocument[] = [];
export const DEFAULT_INCOMING: IncomingDispatch[] = [];
export const DEFAULT_OUTGOING: OutgoingDispatch[] = [];

// Current User Account & Operational Roles (No mock or test accounts)
export const DEFAULT_USER: UserAccount = {
  id: 'user_active',
  name: 'Cán bộ nhà trường',
  email: 'Hoc.teacher@gmail.com',
  role: 'admin',
  department: 'Ban Giám hiệu',
  schoolName: '',
};

export const AVAILABLE_ROLES: { role: UserRole; title: string; desc: string }[] = [
  { role: 'admin', title: 'Quản trị viên hệ thống', desc: 'Toàn quyền cấu hình, phê duyệt và quản lý toàn bộ hệ thống' },
  { role: 'principal', title: 'Hiệu trưởng', desc: 'Ký duyệt văn bản, ban hành quyết định, báo cáo cấp trên' },
  { role: 'vice_principal', title: 'Phó Hiệu trưởng', desc: 'Phụ trách chuyên môn, duyệt kế hoạch dạy học' },
  { role: 'clerk', title: 'Cán bộ văn thư', desc: 'Vào sổ công văn đến/đi, phát hành, cấp số và đóng dấu' },
  { role: 'subject_head', title: 'Tổ trưởng chuyên môn', desc: 'Xây dựng kế hoạch giáo dục, duyệt chuyên môn tổ' },
  { role: 'teacher', title: 'Giáo viên', desc: 'Soạn giáo án, đề thi, phiếu đánh giá, đơn từ' },
  { role: 'staff', title: 'Nhân viên', desc: 'Kế toán, Thư viện, Thiết bị, Y tế học đường' },
];

// Database Manager
export const db = {
  getSchoolProfile(): SchoolProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_SCHOOL_PROFILE;
    } catch {
      return DEFAULT_SCHOOL_PROFILE;
    }
  },

  saveSchoolProfile(profile: SchoolProfile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getDocuments(): AdministrativeDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : DEFAULT_DOCUMENTS;
    } catch {
      return DEFAULT_DOCUMENTS;
    }
  },

  saveDocument(doc: AdministrativeDocument) {
    const list = this.getDocuments();
    const index = list.findIndex((d) => d.id === doc.id);
    if (index >= 0) {
      list[index] = { ...doc, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...doc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(list));
    this.addAuditLog('Tạo/Cập nhật văn bản', `Văn bản: ${doc.title} (${doc.docNumber || 'Bản thảo'})`);
    return doc;
  },

  deleteDocument(id: string) {
    const list = this.getDocuments().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(list));
    this.addAuditLog('Xóa văn bản', `Đã xóa văn bản mã ${id}`);
  },

  getIncomingDispatches(): IncomingDispatch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCOMING);
      return data ? JSON.parse(data) : DEFAULT_INCOMING;
    } catch {
      return DEFAULT_INCOMING;
    }
  },

  saveIncomingDispatch(item: IncomingDispatch) {
    const list = this.getIncomingDispatches();
    const index = list.findIndex((d) => d.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.INCOMING, JSON.stringify(list));
    this.addAuditLog('Ghi sổ văn bản đến', `Số đến: ${item.arrivalNumber} - ${item.summary}`);
  },

  getOutgoingDispatches(): OutgoingDispatch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OUTGOING);
      return data ? JSON.parse(data) : DEFAULT_OUTGOING;
    } catch {
      return DEFAULT_OUTGOING;
    }
  },

  saveOutgoingDispatch(item: OutgoingDispatch) {
    const list = this.getOutgoingDispatches();
    const index = list.findIndex((d) => d.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.OUTGOING, JSON.stringify(list));
    this.addAuditLog('Ghi sổ văn bản đi', `Số đi: ${item.docNumber} - ${item.summary}`);
  },

  getMeetingRecords(): MeetingRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEETINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMeetingRecord(meeting: MeetingRecord) {
    const list = this.getMeetingRecords();
    const index = list.findIndex((m) => m.id === meeting.id);
    if (index >= 0) {
      list[index] = meeting;
    } else {
      list.unshift(meeting);
    }
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(list));
    this.addAuditLog('Lập biên bản cuộc họp', `Cuộc họp: ${meeting.title}`);
  },

  getCurrentUser(): UserAccount {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.email && !parsed.email.endsWith('@truong.edu.vn') && parsed.id !== 'u_admin' && parsed.id !== 'u_clerk') {
          return parsed;
        }
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  setCurrentUser(user: UserAccount) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.addAuditLog('Cập nhật người dùng', `Thiết lập tài khoản: ${user.name} (${user.role})`);
  },

  getAuditLogs(): AuditLogItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addAuditLog(action: string, detail: string, targetId?: string) {
    const user = this.getCurrentUser();
    const logs = this.getAuditLogs();
    const newLog: AuditLogItem = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toLocaleString('vi-VN'),
      userName: user.name,
      userRole: user.role,
      action,
      detail,
      targetId,
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 100)));
  },

  // Export full backup
  exportBackup(): string {
    const backup = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      profile: this.getSchoolProfile(),
      documents: this.getDocuments(),
      incoming: this.getIncomingDispatches(),
      outgoing: this.getOutgoingDispatches(),
      meetings: this.getMeetingRecords(),
      logs: this.getAuditLogs(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore backup
  restoreBackup(jsonString: string): boolean {
    try {
      const backup = JSON.parse(jsonString);
      if (backup.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(backup.profile));
      if (backup.documents) localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(backup.documents));
      if (backup.incoming) localStorage.setItem(STORAGE_KEYS.INCOMING, JSON.stringify(backup.incoming));
      if (backup.outgoing) localStorage.setItem(STORAGE_KEYS.OUTGOING, JSON.stringify(backup.outgoing));
      if (backup.meetings) localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(backup.meetings));
      this.addAuditLog('Khôi phục dữ liệu', 'Khôi phục hệ thống từ bản sao lưu');
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  },
};
