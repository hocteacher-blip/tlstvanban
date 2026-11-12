// Types for SCHOOL DOC AI - Trợ lý văn thư & Quản trị hồ sơ trường học

export type UserRole = 
  | 'admin'          // Quản trị viên hệ thống
  | 'principal'      // Hiệu trưởng
  | 'vice_principal' // Phó Hiệu trưởng
  | 'clerk'          // Văn thư
  | 'subject_head'   // Tổ trưởng chuyên môn
  | 'teacher'        // Giáo viên
  | 'staff';         // Nhân viên (Kế toán, Thư viện, Y tế, Thiết bị)

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  schoolName: string;
}

export interface Permission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canDelete: boolean;
  canExport: boolean;
}

// School Profile
export interface TeacherStaff {
  id: string;
  code: string;
  fullName: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ';
  department: string;      // Tổ chuyên môn: Toán - Tin, KHTN, KHXH, Khối 1, Khối 2,...
  position: string;        // Hiệu trưởng, Phó Hiệu trưởng, Giáo viên, Kế toán...
  phone: string;
  email: string;
  degree: string;          // Trình độ chuyên môn (Đại học, Thạc sĩ,...)
  status: 'Đang công tác' | 'Nghỉ chế độ' | 'Thuyên chuyển';
}

export interface SchoolProfile {
  schoolName: string;            // Ví dụ: TRƯỜNG THCS NGUYỄN DU
  governingBody: string;         // PHÒNG GIÁO DỤC VÀ ĐÀO TẠO QUẬN 1 (hoặc UBND)
  schoolCode: string;            // Mã trường / Mã định danh
  schoolLevel: 'Tiểu học' | 'THCS' | 'Liên cấp TH & THCS';
  address: string;
  phone: string;
  email: string;
  website: string;
  principalName: string;         // Họ tên Hiệu trưởng
  vicePrincipalName: string;     // Họ tên Phó Hiệu trưởng
  unionLeaderName: string;       // Chủ tịch Công đoàn
  partySecretaryName: string;    // Bí thư Chi bộ
  logoUrl?: string;
  staffList: TeacherStaff[];
}

// Administrative Document Types (Nghị định 30/2020/NĐ-CP)
export type DocumentCategory = 
  | 'cong_van'         // Công văn
  | 'quyet_dinh'       // Quyết định
  | 'thong_bao'        // Thông báo
  | 'ke_hoach'         // Kế hoạch
  | 'bao_cao'          // Báo cáo
  | 'to_trinh'         // Tờ trình
  | 'bien_ban'         // Biên bản
  | 'giay_moi'         // Giấy mời
  | 'nghi_quyet'       // Nghị quyết
  | 'chuong_trinh'     // Chương trình công tác
  | 'ho_so_chuyen_mon' // Hồ sơ chuyên môn
  | 'van_ban_dang'     // Văn bản Đảng
  | 'bieu_mau_khac';   // Mẫu khác

export interface AdministrativeDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  docNumber: string;             // Ví dụ: 125/QĐ-THCSND
  issueDate: string;             // dd/MM/yyyy
  location: string;              // Hà Nội, TP. Hồ Chí Minh,...
  subject: string;               // V/v phân công nhiệm vụ năm học...
  signerName: string;
  signerPosition: string;
  recipients: string[];          // Nơi nhận: Phòng GD&ĐT, BGH, Lưu: VT,...
  content: string;               // Markdown or plain text formatted
  status: 'draft' | 'pending' | 'approved' | 'issued';
  createdAt: string;
  updatedAt: string;
  author: string;
}

// Form Field for Form Filling (Module 2)
export interface FormField {
  id: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  category?: 'school' | 'officer' | 'student' | 'content' | 'date' | 'other';
  options?: string[];
  defaultValue?: string;
  value?: string;
  required?: boolean;
}

export interface FormTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  fields: FormField[];
  templateContent: string;       // XML, HTML or tokenized text
  fileType: 'docx' | 'xlsx' | 'pdf';
  isBuiltIn?: boolean;
}

// Dispatch Book (Module 10)
export interface IncomingDispatch {
  id: string;
  arrivalNumber: number;         // Số đến (tự tăng)
  arrivalDate: string;           // Ngày đến
  docNumber: string;             // Số ký hiệu của văn bản đến
  issueDate: string;             // Ngày ban hành
  issuingAuthority: string;      // Cơ quan ban hành (Sở GD, Phòng GD, UBND)
  summary: string;               // Trích yếu nội dung
  assignedTo: string;            // Người / Bộ phận xử lý
  deadline: string;              // Thời hạn xử lý
  status: 'new' | 'processing' | 'pending_approval' | 'completed';
  notes?: string;
  attachmentName?: string;
}

export interface OutgoingDispatch {
  id: string;
  docNumber: string;             // Số đi (ví dụ: 45/TB-THND)
  issueDate: string;             // Ngày ban hành
  summary: string;               // Trích yếu
  drafter: string;               // Người soạn thảo
  reviewer: string;              // Người duyệt (Phó Hiệu trưởng)
  signer: string;                // Người ký (Hiệu trưởng)
  recipients: string;            // Nơi nhận
  status: 'draft' | 'pending_approval' | 'approved' | 'issued';
  attachmentName?: string;
}

// Meeting Minutes (Module 4)
export interface MeetingRecord {
  id: string;
  title: string;
  meetingType: 'hoidong' | 'tochuyenmon' | 'chibo' | 'phuhuynh' | 'chuyende' | 'giaoban';
  date: string;
  location: string;
  chairperson: string;          // Chủ trì
  secretary: string;            // Thư ký
  attendeesCount: number;
  contentSummary: string;
  discussionPoints: string[];
  conclusions: string[];
  tasks: {
    id: string;
    assignee: string;
    task: string;
    deadline: string;
  }[];
  fullTranscript?: string;
  createdAt: string;
}

// Audit Log
export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  detail: string;
  targetId?: string;
}
