import { FormTemplate } from '../types';

export const TEMPLATE_CATEGORIES = [
  'Văn bản hành chính',
  'Công tác chuyên môn',
  'Công tác Đảng',
  'Hồ sơ giáo viên',
  'Hồ sơ học sinh',
  'Công tác kiểm định',
  'Y tế học đường',
  'Thư viện',
  'Thiết bị',
  'Tài chính – Kế toán',
  'Công tác đoàn thể',
  'Thi đua – Khen thưởng',
];

export const PRESET_TEMPLATES: FormTemplate[] = [
  {
    id: 'tpl_qd_phancong',
    title: 'Quyết định phân công nhiệm vụ cán bộ, giáo viên',
    category: 'Văn bản hành chính',
    description: 'Quyết định đầu năm học phân công nhiệm vụ chuyên môn và chủ nhiệm lớp theo quy định Điều lệ trường.',
    tags: ['Quyết định', 'Phân công', 'Đầu năm học', 'Nghị định 30'],
    fileType: 'docx',
    isBuiltIn: true,
    fields: [
      { id: 'nam_hoc', label: 'Năm học', placeholder: 'VD: 2026 - 2027', type: 'text', category: 'content', required: true },
      { id: 'so_quyet_dinh', label: 'Số quyết định', placeholder: 'VD: 142/QĐ-THCS', type: 'text', category: 'content', required: true },
      { id: 'ngay_ban_hanh', label: 'Ngày ban hành', placeholder: 'dd/mm/yyyy', type: 'date', category: 'date', required: true },
      { id: 'ho_ten_gv', label: 'Họ tên Giáo viên', placeholder: 'Nhập họ và tên cán bộ/giáo viên...', type: 'text', category: 'officer', required: true },
      { id: 'ngay_sinh', label: 'Ngày sinh', placeholder: 'dd/mm/yyyy', type: 'text', category: 'officer' },
      { id: 'to_chuyen_mon', label: 'Tổ chuyên môn', placeholder: 'VD: Tổ Khoa học Tự nhiên', type: 'text', category: 'officer' },
      { id: 'nhiem_vu', label: 'Nhiệm vụ cụ thể', placeholder: 'Nhập chi tiết nhiệm vụ giảng dạy, kiêm nhiệm...', type: 'textarea', category: 'content', required: true },
      { id: 'he_so_phu_cap', label: 'Mức phụ cấp trách nhiệm', placeholder: 'VD: 0.3', type: 'text', category: 'content' },
    ],
    templateContent: `QUYẾT ĐỊNH
Về việc phân công nhiệm vụ cán bộ, giáo viên năm học {{nam_hoc}}

Căn cứ Thông tư 32/2020/TT-BGDĐT ban hành Điều lệ trường trung học;
Xét đề nghị của Ban Giám hiệu Trường {{ten_truong}},

QUYẾT ĐỊNH:

Điều 1. Phân công Ông/Bà: {{ho_ten_gv}}
- Ngày tháng năm sinh: {{ngay_sinh}}
- Tổ chuyên môn: {{to_chuyen_mon}}
- Đảm nhận nhiệm vụ trong năm học {{nam_hoc}}: {{nhiem_vu}}
- Mức phụ cấp trách nhiệm được hưởng: {{he_so_phu_cap}} (nếu có).

Điều 2. Ông/Bà: {{ho_ten_gv}} chịu trách nhiệm thực hiện đầy đủ kế hoạch dạy học, quy chế chuyên môn và các quy định của nhà trường.

Điều 3. Quyết định có hiệu lực kể từ ngày ký. Ban Giám hiệu, các tổ chuyên môn và Ông/Bà có tên tại Điều 1 căn cứ quyết định thi hành.`,
  },

  {
    id: 'tpl_giay_moi_ph',
    title: 'Giấy mời họp Ban đại diện Cha mẹ học sinh',
    category: 'Hồ sơ học sinh',
    description: 'Giấy mời gửi cha mẹ học sinh tham dự cuộc họp định kỳ đầu năm hoặc sơ kết học kỳ.',
    tags: ['Giấy mời', 'Phụ huynh', 'Học sinh'],
    fileType: 'docx',
    isBuiltIn: true,
    fields: [
      { id: 'kinh_gui_ph', label: 'Kính gửi Phụ huynh em', placeholder: 'Nhập họ và tên học sinh', type: 'text', category: 'student', required: true },
      { id: 'lop', label: 'Học sinh lớp', placeholder: 'VD: 9A1', type: 'text', category: 'student', required: true },
      { id: 'thoi_gian', label: 'Thời gian họp', placeholder: 'VD: 08 giờ 00, Chủ Nhật ngày 20/09/2026', type: 'text', category: 'content', required: true },
      { id: 'dia_diem', label: 'Địa điểm', placeholder: 'VD: Phòng học lớp 9A1 (Tầng 2)', type: 'text', category: 'content', required: true },
      { id: 'noi_dung_hop', label: 'Nội dung chính cuộc họp', placeholder: 'Nhập nội dung chương trình họp...', type: 'textarea', category: 'content', required: true },
      { id: 'gvcn', label: 'Giáo viên chủ nhiệm', placeholder: 'Nhập họ tên giáo viên chủ nhiệm', type: 'text', category: 'officer', required: true },
    ],
    templateContent: `GIẤY MỜI HỌP PHỤ HUYNH HỌC SINH
Năm học {{nam_hoc}}

Kính gửi: Ông/Bà Phụ huynh của em: {{kinh_gui_ph}}
Học sinh lớp: {{lop}}, Trường {{ten_truong}}

Ban Giám hiệu nhà trường và Giáo viên chủ nhiệm trân trọng kính mời Ông/Bà tới tham dự buổi họp Ban đại diện Cha mẹ học sinh:
- Thời gian: {{thoi_gian}}
- Địa điểm: {{dia_diem}}
- Nội dung cuộc họp: {{noi_dung_hop}}

Sự có mặt đầy đủ của Quý phụ huynh là nguồn động viên to lớn giúp nhà trường và gia đình phối hợp chăm lo tốt nhất cho các em học sinh.

Rất mong Quý phụ huynh sắp xếp thời gian tham dự đúng giờ!`,
  },

  {
    id: 'tpl_giay_khen',
    title: 'Giấy khen học sinh xuất sắc / tiêu biểu',
    category: 'Thi đua – Khen thưởng',
    description: 'Mẫu quyết định trao tặng giấy khen và bản in giấy khen theo Thông tư 22/2021/TT-BGDĐT.',
    tags: ['Giấy khen', 'Học sinh', 'Khen thưởng', 'Thông tư 22'],
    fileType: 'docx',
    isBuiltIn: true,
    fields: [
      { id: 'ho_ten_hs', label: 'Họ và tên học sinh', placeholder: 'Nhập họ và tên học sinh', type: 'text', category: 'student', required: true },
      { id: 'lop', label: 'Lớp', placeholder: 'VD: 8B', type: 'text', category: 'student', required: true },
      { id: 'danh_hieu', label: 'Danh hiệu đạt được', placeholder: 'VD: Học sinh Xuất sắc', type: 'text', category: 'content', required: true },
      { id: 'thanh_tich', label: 'Thành tích nổi bật', placeholder: 'Nhập chi tiết thành tích học tập và rèn luyện...', type: 'textarea', category: 'content' },
      { id: 'so_quyet_dinh', label: 'Vào sổ khen thưởng số', placeholder: 'Số quyết định / Số vào sổ', type: 'text', category: 'content' },
    ],
    templateContent: `TRƯỜNG {{ten_truong}}
QUYẾT ĐỊNH KHEN THƯỞNG

HIỆU TRƯỞNG TRƯỜNG {{ten_truong}}
TẶNG GIẤY KHEN CHO:

Em: {{ho_ten_hs}}
Học sinh lớp: {{lop}}

Đã đạt danh hiệu: {{danh_hieu}}
{{thanh_tich}}

Ghi nhận thành tích và chúc em tiếp tục phát huy trong những năm học tiếp theo!`,
  },

  {
    id: 'tpl_don_nghiphep',
    title: 'Đơn xin nghỉ phép của cán bộ, giáo viên',
    category: 'Hồ sơ giáo viên',
    description: 'Đơn xin nghỉ phép năm hoặc việc riêng dành cho cán bộ, giáo viên, nhân viên nhà trường.',
    tags: ['Đơn từ', 'Nghỉ phép', 'Giáo viên', 'Viên chức'],
    fileType: 'docx',
    isBuiltIn: true,
    fields: [
      { id: 'ho_ten_gv', label: 'Họ tên người làm đơn', placeholder: 'Nhập họ và tên người làm đơn', type: 'text', category: 'officer', required: true },
      { id: 'chuc_vu', label: 'Chức danh / Chức vụ', placeholder: 'VD: Giáo viên môn Toán', type: 'text', category: 'officer' },
      { id: 'to_chuyen_mon', label: 'Tổ chuyên môn', placeholder: 'VD: Tổ Khoa học Tự nhiên', type: 'text', category: 'officer' },
      { id: 'so_ngay_nghi', label: 'Số ngày xin nghỉ', placeholder: 'VD: 02 ngày', type: 'text', category: 'content', required: true },
      { id: 'tu_ngay', label: 'Từ ngày', placeholder: 'dd/mm/yyyy', type: 'text', category: 'date', required: true },
      { id: 'den_ngay', label: 'Đến hết ngày', placeholder: 'dd/mm/yyyy', type: 'text', category: 'date', required: true },
      { id: 'ly_do', label: 'Lý do xin nghỉ', placeholder: 'Nhập lý do xin nghỉ phép...', type: 'textarea', category: 'content', required: true },
      { id: 'nguoi_day_thay', label: 'Người dạy thay / đảm nhận công việc', placeholder: 'Nhập thông tin người nhận bàn giao công việc...', type: 'text', category: 'content' },
    ],
    templateContent: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-----------------
ĐƠN XIN NGHỈ PHÉP

Kính gửi:
- Ban Giám hiệu Trường {{ten_truong}};
- Tổ trưởng chuyên môn Tổ {{to_chuyen_mon}}.

Tôi tên là: {{ho_ten_gv}}
Chức vụ / Công tác: {{chuc_vu}}
Đơn vị công tác: Tổ {{to_chuyen_mon}}, Trường {{ten_truong}}.

Nay tôi làm đơn này kính xin Ban Giám hiệu và Tổ chuyên môn cho phép tôi được nghỉ phép:
- Thời gian: {{so_ngay_nghi}} (Từ ngày {{tu_ngay}} đến hết ngày {{den_ngay}}).
- Lý do xin nghỉ: {{ly_do}}
- Biện pháp khắc phục trong thời gian nghỉ: {{nguoi_day_thay}}.

Tôi cam kết chấp hành nghiêm túc nội quy cơ quan và bảo đảm tiến độ dạy học theo đúng quy định.
Kính mong Ban Giám hiệu xem xét, phê duyệt.

Xin trân trọng cảm ơn!`,
  },

  {
    id: 'tpl_kehoach_chuyenmon',
    title: 'Kế hoạch giáo dục tổ chuyên môn (CV 5512)',
    category: 'Công tác chuyên môn',
    description: 'Khung kế hoạch dạy học môn học và hoạt động giáo dục theo Công văn số 5512/BGDĐT-GDTrH.',
    tags: ['Kế hoạch', 'Chuyên môn', 'Công văn 5512', 'BGDĐT'],
    fileType: 'docx',
    isBuiltIn: true,
    fields: [
      { id: 'to_chuyen_mon', label: 'Tổ chuyên môn', placeholder: 'VD: Tổ Khoa học tự nhiên', type: 'text', category: 'officer', required: true },
      { id: 'mon_hoc', label: 'Môn học / Hoạt động', placeholder: 'VD: Khoa học tự nhiên lớp 7', type: 'text', category: 'content', required: true },
      { id: 'so_tiet_tuan', label: 'Số tiết / tuần', placeholder: 'VD: 4 tiết/tuần (Tổng 140 tiết/năm)', type: 'text', category: 'content' },
      { id: 'muc_tieu', label: 'Mục tiêu trọng tâm', placeholder: 'Mục tiêu phẩm chất và năng lực cần đạt...', type: 'textarea', category: 'content' },
    ],
    templateContent: `KẾ HOẠCH DẠY HỌC VÀ HOẠT ĐỘNG GIÁO DỤC
Tổ chuyên môn: {{to_chuyen_mon}}
Môn học: {{mon_hoc}} - Năm học {{nam_hoc}}

I. ĐẶC ĐIỂM TÌNH HÌNH
1. Đội ngũ giáo viên:
- Tổng số giáo viên: Đảm bảo đủ biên chế giảng dạy.
- Trình độ đạt chuẩn và trên chuẩn theo quy định hiện hành.
2. Thiết bị dạy học:
- Phòng thực hành bộ môn, thiết bị và phương tiện dạy học đáp ứng yêu cầu.

II. KẾ HOẠCH DẠY HỌC
- Định mức: {{so_tiet_tuan}}.
- Mục tiêu môn học: {{muc_tieu}}.
- Đổi mới phương pháp dạy học và kiểm tra đánh giá theo định hướng phát triển năng lực học sinh.`,
  },

  {
    id: 'tpl_bb_chibo',
    title: 'Biên bản sinh hoạt Chi bộ Đảng định kỳ',
    category: 'Công tác Đảng',
    description: 'Biên bản sinh hoạt Chi bộ Đảng hàng tháng theo Hướng dẫn của Ban Tổ chức Trung ương.',
    tags: ['Đảng', 'Chi bộ', 'Biên bản', 'Sinh hoạt định kỳ'],
    fileType: 'docx',
    isBuiltIn: true,
    fields: [
      { id: 'chi_bo', label: 'Tên Chi bộ', placeholder: 'VD: Chi bộ Trường...', type: 'text', category: 'school', required: true },
      { id: 'thoi_gian', label: 'Thời gian', placeholder: 'VD: 14 giờ 00 ngày ... tháng ... năm ...', type: 'text', category: 'date', required: true },
      { id: 'tong_dang_vien', label: 'Tổng số Đảng viên', placeholder: 'VD: ... đồng chí (Chính thức: ..., Dự bị: ...)', type: 'text', category: 'content' },
      { id: 'chu_tri', label: 'Đồng chí chủ trì', placeholder: 'Họ tên và chức vụ đ/c chủ trì', type: 'text', category: 'officer', required: true },
      { id: 'thu_ky', label: 'Đồng chí thư ký', placeholder: 'Họ tên đ/c thư ký', type: 'text', category: 'officer', required: true },
    ],
    templateContent: `ĐẢNG BỘ CẤP TRÊN
{{chi_bo}}
***
BIÊN BẢN SINH HOẠT CHI BỘ ĐỊNH KỲ THÁNG

Thời gian: {{thoi_gian}}
Địa điểm: Văn phòng Chi bộ Trường {{ten_truong}}
Chủ trì: Đ/c {{chu_tri}}
Thư ký: Đ/c {{thu_ky}}
Tổng số Đảng viên tham dự: {{tong_dang_vien}}.

NỘI DUNG SINH HOẠT:
1. Thông tin thời sự, chính sách mới và công tác tư tưởng.
2. Đánh giá tình hình thực hiện nhiệm vụ chính trị và công tác chuyên môn trong tháng qua.
3. Thảo luận đóng góp ý kiến của các đồng chí Đảng viên.
4. Kết luận của Đồng chí Bí thư Chi bộ và biểu quyết Nghị quyết sinh hoạt.`,
  },
];
