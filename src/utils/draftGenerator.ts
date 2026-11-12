import { DocumentCategory, SchoolProfile } from '../types';

export interface GeneratedDraft {
  title: string;
  docNumber: string;
  subject: string;
  signerPosition: string;
  signerName: string;
  recipients: string;
  content: string;
}

/**
 * Generates an authoritative, complete Decree 30/2020/NĐ-CP compliant draft
 * based on document type, user prompt, and school profile.
 */
export function generateLocalDecree30Draft(
  category: DocumentCategory,
  userPrompt: string,
  schoolProfile: SchoolProfile,
  location: string,
  issueDate: string
): GeneratedDraft {
  const schoolName = schoolProfile.schoolName || 'TRƯỜNG TRUNG HỌC CƠ SỞ';
  const governingBody = schoolProfile.governingBody || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO';
  const principalName = schoolProfile.principalName || '[Họ tên Hiệu trưởng]';
  const level = schoolProfile.schoolLevel || 'THCS';
  const codePrefix = schoolProfile.schoolCode ? schoolProfile.schoolCode.split('-')[1] || level : level;
  const prompt = userPrompt.trim();

  switch (category) {
    case 'quyet_dinh': {
      const isPhanCong = !prompt || prompt.toLowerCase().includes('phân công') || prompt.toLowerCase().includes('nhiệm vụ');
      const isKhenThuong = prompt.toLowerCase().includes('khen thưởng') || prompt.toLowerCase().includes('thi đua');
      const isHoiDong = prompt.toLowerCase().includes('hội đồng') || prompt.toLowerCase().includes('thành lập');

      if (isKhenThuong) {
        return {
          title: `QUYẾT ĐỊNH\nVề việc khen thưởng học sinh và giáo viên có thành tích xuất sắc`,
          docNumber: `…/QĐ-${codePrefix}`,
          subject: 'V/v khen thưởng thành tích xuất sắc trong đợt thi đua',
          signerPosition: 'HIỆU TRƯỞNG',
          signerName: principalName,
          recipients: 'Như Điều 3; Hội đồng TĐ-KT; Các tổ chuyên môn; Lưu: VT.',
          content: `Căn cứ Luật Thi đua, Khen thưởng số 06/2022/QH15 ngày 15 tháng 6 năm 2022;
Căn cứ Thông tư số 32/2020/TT-BGDĐT ngày 15 tháng 9 năm 2020 của Bộ trưởng Bộ Giáo dục và Đào tạo ban hành Điều lệ trường trung học cơ sở, trường trung học phổ thông và trường phổ thông có nhiều cấp học;
Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;
Xét đề nghị của Hội đồng Thi đua - Khen thưởng Trường ${schoolName},

QUYẾT ĐỊNH:

Điều 1. Tặng Giấy khen và phần thưởng cho các tập thể lớp và cá nhân cán bộ, giáo viên, học sinh có thành tích xuất sắc trong phong trào thi đua dạy tốt - học tốt (Có danh sách cụ thể kèm theo).

Điều 2. Mức tiền thưởng kèm theo Giấy khen được trích từ Quỹ thi đua - khen thưởng của nhà trường theo đúng Quy chế chi tiêu nội bộ hiện hành.

Điều 3. Quyết định có hiệu lực thi hành kể từ ngày ký.
Ban Giám hiệu, Ban Chấp hành Công đoàn, Hội đồng Thi đua - Khen thưởng, các tổ chuyên môn và các cá nhân có tên tại Điều 1 căn cứ Quyết định thi hành./.`,
        };
      }

      if (isHoiDong) {
        return {
          title: `QUYẾT ĐỊNH\nVề việc thành lập Hội đồng trường nhiệm kỳ 2026 - 2031`,
          docNumber: `…/QĐ-${codePrefix}`,
          subject: 'V/v thành lập Hội đồng trường theo quy định Điều lệ trường học',
          signerPosition: 'HIỆU TRƯỞNG',
          signerName: principalName,
          recipients: 'Như Điều 3; Lãnh đạo Phòng GD&ĐT (để b/c); Chi bộ nhà trường; Lưu: VT.',
          content: `Căn cứ Luật Giáo dục số 43/2019/QH14 ngày 14 tháng 6 năm 2019;
Căn cứ Thông tư số 32/2020/TT-BGDĐT ngày 15 tháng 9 năm 2020 của Bộ trưởng Bộ Giáo dục và Đào tạo ban hành Điều lệ trường trung học cơ sở, trường trung học phổ thông và trường phổ thông có nhiều cấp học;
Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;
Xét đề nghị của Hội đồng sư phạm và Thư ký Hội đồng Trường ${schoolName},

QUYẾT ĐỊNH:

Điều 1. Thành lập Hội đồng trường Trường ${schoolName} nhiệm kỳ 2026 - 2031 gồm các thành viên sau:
1. Ông/Bà: ${principalName} - Hiệu trưởng - Chủ tịch Hội đồng;
2. Ông/Bà: [Họ tên Phó Hiệu trưởng] - Phó Hiệu trưởng - Phó Chủ tịch Hội đồng;
3. Ông/Bà: [Họ tên Bí thư Chi bộ] - Bí thư Chi bộ - Thành viên;
4. Ông/Bà: [Họ tên Chủ tịch Công đoàn] - Chủ tịch Công đoàn - Thành viên;
5. Ông/Bà: [Họ tên Bí thư Đoàn TN / TPT Đội] - Thành viên;
6. Đại diện Tổ trưởng các tổ chuyên môn và đại diện Ban đại diện Cha mẹ học sinh.

Điều 2. Hội đồng trường thực hiện các nhiệm vụ và quyền hạn theo quy định tại Điều 10 Thông tư số 32/2020/TT-BGDĐT của Bộ Giáo dục và Đào tạo. Các thành viên Hội đồng làm việc theo chế độ kiêm nhiệm.

Điều 3. Quyết định có hiệu lực thi hành kể từ ngày ký.
Các tổ chức, đoàn thể, bộ phận chuyên môn thuộc trường và các thành viên có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.`,
        };
      }

      // Default Phân công nhiệm vụ
      return {
        title: `QUYẾT ĐỊNH\nVề việc phân công nhiệm vụ cán bộ, giáo viên và nhân viên\nNăm học 2026 - 2027`,
        docNumber: `…/QĐ-${codePrefix}`,
        subject: 'V/v phân công nhiệm vụ chuyên môn và chủ nhiệm năm học 2026 - 2027',
        signerPosition: 'HIỆU TRƯỞNG',
        signerName: principalName,
        recipients: 'Như Điều 3; Lãnh đạo Phòng GD&ĐT (để b/c); Các tổ chuyên môn, văn phòng; Lưu: VT.',
        content: `Căn cứ Luật Giáo dục số 43/2019/QH14 ngày 14 tháng 6 năm 2019;
Căn cứ Thông tư số 32/2020/TT-BGDĐT ngày 15 tháng 9 năm 2020 của Bộ Giáo dục và Đào tạo ban hành Điều lệ trường trung học;
Căn cứ Thông tư số 28/2009/TT-BGDĐT và Thông tư số 15/2017/TT-BGDĐT quy định về chế độ làm việc đối với giáo viên phổ thông;
Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;
Xét đề nghị của các Tổ trưởng chuyên môn và Trưởng ban Thanh tra nhân dân,

QUYẾT ĐỊNH:

Điều 1. Phân công nhiệm vụ giảng dạy, công tác chủ nhiệm lớp và phụ trách các phòng chức năng cho toàn thể cán bộ, giáo viên, nhân viên Trường ${schoolName} năm học 2026 - 2027 (Kèm theo Bảng phân công chi tiết số tiết, bộ môn và lớp phụ trách).

Điều 2. Cán bộ, giáo viên, nhân viên có tên trong danh sách chịu trách nhiệm thực hiện nghiêm túc quy chế chuyên môn, bảo đảm ngày giờ công, chuẩn bị bài giảng chu đáo và nâng cao chất lượng giáo dục toàn diện của nhà trường.

Điều 3. Quyết định này có hiệu lực kể từ ngày bắt đầu năm học mới.
Ban Giám hiệu, Tổ trưởng các tổ chuyên môn, Tổ Văn phòng và toàn thể cán bộ, giáo viên có tên tại Điều 1 căn cứ Quyết định thi hành./.`,
      };
    }

    case 'cong_van': {
      return {
        title: `CÔNG VĂN HÀNH CHÍNH`,
        docNumber: `…/CV-${codePrefix}`,
        subject: prompt ? `V/v ${prompt}` : 'V/v đề xuất cấp kinh phí sửa chữa và trang bị cơ sở vật chất năm học mới',
        signerPosition: 'HIỆU TRƯỞNG',
        signerName: principalName,
        recipients: `Kính gửi: ${governingBody};\nNhư kính gửi;\nLãnh đạo Phòng GD&ĐT (để b/c);\nLưu: VT.`,
        content: `Kính gửi: ${governingBody}.

Thực hiện Kế hoạch số 45/KH-UBND của Ủy ban nhân dân về việc chuẩn bị các điều kiện cơ sở vật chất phục vụ đổi mới chương trình giáo dục phổ thông;
Căn cứ tình hình khảo sát thực tế phòng học bộ môn và trang thiết bị dạy học của Trường ${schoolName};

Nhà trường trân trọng kính báo cáo và đề xuất Quý cơ quan xem xét các nội dung sau:

1. Hiện trạng cơ sở vật chất:
- Phòng thực hành Tin học số 2 gồm 25 máy tính đã qua nhiều năm sử dụng, tỷ lệ máy hư hỏng cao, không đáp ứng đủ yêu cầu thực hành lập trình và ứng dụng công nghệ thông tin cho học sinh.
- Màn hình tương tác tại các phòng học bộ môn Khoa học tự nhiên cần được bảo dưỡng định kỳ và bổ sung hệ thống âm thanh trợ giảng cho giáo viên.

2. Nội dung đề xuất:
- Kính đề nghị Quý Lãnh đạo xem xét phê duyệt chủ trương và phân bổ kinh phí sửa chữa, nâng cấp hệ thống phòng máy tính với dự toán kinh phí khoảng: [CẦN BỔ SUNG: Số tiền VNĐ].
- Trang bị bổ sung thiết bị số theo danh mục thiết bị dạy học tối thiểu do Bộ Giáo dục và Đào tạo ban hành.

3. Cam kết của nhà trường:
Trường ${schoolName} cam kết quản lý, sử dụng nguồn kinh phí đúng mục đích, công khai, minh bạch và phát huy tối đa hiệu quả trong công tác giáo dục học sinh.

Kính mong Quý Lãnh đạo quan tâm xem xét, tạo điều kiện giúp nhà trường hoàn thành tốt nhiệm vụ năm học./.`,
      };
    }

    case 'thong_bao': {
      return {
        title: `THÔNG BÁO\n${prompt ? prompt.toUpperCase() : 'VỀ LỊCH NGHỈ LỄ VÀ PHƯƠNG HƯỚNG TỔ CHỨC CÁC HOẠT ĐỘNG GIÁO DỤC'}`,
        docNumber: `…/TB-${codePrefix}`,
        subject: prompt ? `V/v ${prompt}` : 'V/v kế hoạch tổ chức hoạt động giáo dục và lịch nghỉ lễ theo quy định',
        signerPosition: 'HIỆU TRƯỞNG',
        signerName: principalName,
        recipients: 'Toàn thể CB, GV, NV nhà trường; Ban đại diện CMHS; Các lớp học sinh; Lưu: VT.',
        content: `Kính gửi:
- Toàn thể cán bộ quản lý, giáo viên, nhân viên nhà trường;
- Các bậc phụ huynh và học sinh Trường ${schoolName}.

Căn cứ Bộ luật Lao động số 45/2019/QH14 của Quốc hội;
Căn cứ văn bản hướng dẫn của Ủy ban nhân dân và ${governingBody};
Trường ${schoolName} thông báo kế hoạch tổ chức như sau:

1. Thời gian nghỉ lễ / điều chỉnh lịch học:
- Thời gian bắt đầu: Từ ngày [CẦN BỔ SUNG: dd/mm/yyyy] đến hết ngày [CẦN BỔ SUNG: dd/mm/yyyy].
- Thời gian đi học lại bình thường: Ngày [CẦN BỔ SUNG: dd/mm/yyyy].

2. Công tác phân công trực và bảo vệ an toàn cơ quan:
- Cán bộ, giáo viên, nhân viên thực hiện nghiêm túc lịch trực trường, niêm phong các phòng thực hành, kiểm tra ngắt hệ thống điện và thiết bị phòng cháy chữa cháy trước khi nghỉ.
- Tổ Bảo vệ trực 24/24 giờ, bảo đảm an ninh trật tự và an toàn tài sản nhà trường.

3. Dặn dò đối với học sinh:
- Học sinh ôn tập bài vở đầy đủ, chấp hành nghiêm túc Luật An toàn giao thông, quy định phòng chống đuối nước và quy tắc ứng xử nơi công cộng.

Nhà trường yêu cầu các tổ chuyên môn, giáo viên chủ nhiệm triển khai thông báo này đến toàn thể phụ huynh và học sinh được biết và nghiêm túc thực hiện./.`,
      };
    }

    case 'ke_hoach': {
      return {
        title: `KẾ HOẠCH\n${prompt ? prompt.toUpperCase() : 'TỔ CHỨC PHONG TRÀO THI ĐUA VÀ HỘI THI GIÁO VIÊN DẠY GIỎI CẤP TRƯỜNG'}`,
        docNumber: `…/KH-${codePrefix}`,
        subject: prompt ? `V/v ${prompt}` : 'Kế hoạch tổ chức Hội thi Giáo viên dạy giỏi cấp trường năm học 2026 - 2027',
        signerPosition: 'HIỆU TRƯỞNG',
        signerName: principalName,
        recipients: 'Ban Giám hiệu; Ban Chấp hành Công đoàn; Các tổ chuyên môn; Lưu: VT.',
        content: `Căn cứ Thông tư số 22/2019/TT-BGDĐT ban hành Quy định về Hội thi giáo viên dạy giỏi cơ sở giáo dục mầm non, giáo viên dạy giỏi, giáo viên chủ nhiệm lớp giỏi cơ sở giáo dục phổ thông;
Căn cứ Kế hoạch thực hiện nhiệm vụ năm học 2026 - 2027 của Trường ${schoolName};
Nhà trường xây dựng Kế hoạch tổ chức với các nội dung cụ thể sau:

I. MỤC ĐÍCH, YÊU CẦU
1. Mục đích:
- Khuyến khích, động viên giáo viên tự học, sáng tạo, đổi mới phương pháp giảng dạy theo định hướng phát triển phẩm chất và năng lực người học.
- Đánh giá thực trạng đội ngũ giáo viên, từ đó xây dựng kế hoạch bồi dưỡng nâng cao trình độ chuyên môn, nghiệp vụ.
2. Yêu cầu:
- Hội thi được tổ chức trên tinh thần khách quan, công bằng, thực chất, không gây áp lực cho giáo viên tham gia.

II. NỘI DUNG VÀ HÌNH THỨC THI
1. Trình bày một biện pháp góp phần nâng cao chất lượng công tác giảng dạy hoặc công tác chủ nhiệm.
2. Thực hành dạy một tiết học theo kế hoạch dạy học tại thời điểm diễn ra Hội thi.

III. THỜI GIAN VÀ ĐỊA ĐIỂM
- Thời gian khai mạc: [CẦN BỔ SUNG: Ngày/tháng/năm].
- Địa điểm: Phòng học bộ môn và phòng đa năng Trường ${schoolName}.

IV. TỔ CHỨC THỰC HIỆN
- Ban Giám hiệu ra quyết định thành lập Ban Tổ chức và Ban Giám khảo.
- Các Tổ chuyên môn tổ chức sinh hoạt chuyên môn, chuẩn bị và hỗ trợ giáo viên dự thi đạt kết quả cao nhất./.`,
      };
    }

    case 'to_trinh': {
      return {
        title: `TỜ TRÌNH\nVề việc xin phê duyệt chủ trương và kinh phí sửa chữa cơ sở vật chất`,
        docNumber: `…/TTr-${codePrefix}`,
        subject: 'V/v đề nghị phê duyệt chủ trương sửa chữa, cải tạo phòng học bộ môn',
        signerPosition: 'HIỆU TRƯỞNG',
        signerName: principalName,
        recipients: `Kính gửi: Lãnh đạo ${governingBody};\nNhư kính gửi;\nLưu: VT.`,
        content: `Kính gửi: ${governingBody}.

Căn cứ Luật Ngân sách Nhà nước số 83/2015/QH13;
Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05/3/2020 của Chính phủ về công tác văn thư;
Căn cứ tình hình thực tế về cơ sở vật chất phục vụ công tác dạy và học của Trường ${schoolName};

Trường ${schoolName} kính trình Quý cấp xem xét phê duyệt chủ trương với các nội dung sau:

1. Sự cần thiết đầu tư sửa chữa:
- Hệ thống phòng thực hành thí nghiệm và mái hiên dãy phòng học phía Tây đã xuống cấp, thấm dột trong mùa mưa bão, tiềm ẩn nguy cơ mất an toàn cho cán bộ, giáo viên và học sinh.
- Nhằm đảm bảo an toàn trường học và duy trì tiêu chuẩn trường đạt chuẩn quốc gia.

2. Quy mô và hạng mục đề xuất sửa chữa:
- Chống thấm, sơn mới toàn bộ hành lang và trần 12 phòng học.
- Thay mới hệ thống dây dẫn điện và đèn chiếu sáng đạt tiêu chuẩn học đường.
- Dự kiến tổng mức đầu tư: [CẦN BỔ SUNG: ... VNĐ] (Bằng chữ: [CẦN BỔ SUNG: ...]).

3. Nguồn vốn thực hiện:
- Đề nghị hỗ trợ từ nguồn kinh phí sự nghiệp giáo dục năm 2026 và nguồn quỹ phát triển hoạt động sự nghiệp của đơn vị.

Kính trình ${governingBody} xem xét, thẩm định và phê duyệt chủ trương để nhà trường triển khai các bước tiếp theo theo quy định của pháp luật./.`,
      };
    }

    case 'bao_cao': {
      return {
        title: `BÁO CÁO\n${prompt ? prompt.toUpperCase() : 'TÌNH HÌNH THỰC HIỆN NHIỆM VỤ VÀ KẾT QUẢ CÔNG TÁC GIÁO DỤC HỌC KỲ I'}`,
        docNumber: `…/BC-${codePrefix}`,
        subject: prompt ? `V/v ${prompt}` : 'Báo cáo sơ kết học kỳ I về công tác giáo dục và quản lý nhà trường',
        signerPosition: 'HIỆU TRƯỞNG',
        signerName: principalName,
        recipients: `${governingBody} (để b/c); Chi bộ nhà trường; Các tổ chuyên môn; Lưu: VT.`,
        content: `Kính gửi: ${governingBody}.

Thực hiện Hướng dẫn của ${governingBody} về công tác sơ kết, đánh giá tình hình thực hiện nhiệm vụ năm học;
Trường ${schoolName} trân trọng báo cáo kết quả công tác như sau:

I. ĐẶC ĐIỂM TÌNH HÌNH
1. Đội ngũ cán bộ, giáo viên, nhân viên:
- Tổng số cán bộ quản lý, giáo viên, nhân viên: [CẦN BỔ SUNG: Số lượng] người (Biên chế: ..., Hợp đồng: ...).
- Trình độ chuyên môn đạt chuẩn và trên chuẩn: Đạt 100%.
2. Tình hình học sinh:
- Toàn trường có [CẦN BỔ SUNG: Số lượng] học sinh, chia thành [CẦN BỔ SUNG: Số lượng] lớp.

II. KẾT QUẢ ĐẠT ĐƯỢC
1. Công tác dạy học và giáo dục đạo đức:
- Thực hiện nghiêm túc khung phân phối chương trình và đổi mới phương pháp dạy học theo Chương trình GDPT 2018.
- Tỷ lệ học sinh đạt kết quả học tập Khá, Tốt đạt [CẦN BỔ SUNG: ...]%, kết quả rèn luyện Tốt đạt [CẦN BỔ SUNG: ...]%.
2. Công tác chuyển đổi số và quản lý hồ sơ:
- 100% văn bản hành chính được phát hành và quản lý số hóa qua hệ thống SCHOOL DOC AI đúng chuẩn Nghị định 30/2020/NĐ-CP.

III. PHƯƠNG HƯỚNG NHIỆM VỤ HỌC KỲ TIẾP THEO
- Tiếp tục nâng cao chất lượng dạy học đại trà và bồi dưỡng học sinh giỏi.
- Tổ chức kiểm tra, đánh giá học sinh nghiêm túc theo Thông tư 22/2021/TT-BGDĐT.

Trường ${schoolName} kính báo cáo Quý cơ quan chỉ đạo, theo dõi./.`,
      };
    }

    case 'bien_ban': {
      return {
        title: `BIÊN BẢN\n${prompt ? prompt.toUpperCase() : 'HỌP HỘI ĐỒNG SƯ PHẠM ĐỊNH KỲ THÁNG'}`,
        docNumber: `…/BB-${codePrefix}`,
        subject: prompt ? `Biên bản ${prompt}` : 'Biên bản cuộc họp Hội đồng sư phạm triển khai công tác trọng tâm',
        signerPosition: 'CHỦ TRÌ CUỘC HỌP',
        signerName: principalName,
        recipients: 'Ban Giám hiệu; Thư ký Hội đồng; Lưu: VT.',
        content: `Thời gian: Vào hồi [CẦN BỔ SUNG: 14 giờ 00], ngày ${issueDate}.
Địa điểm: Văn phòng Hội đồng Trường ${schoolName}.

I. THÀNH PHẦN THAM DỰ
1. Chủ trì: Ông/Bà: ${principalName} - Chức vụ: Hiệu trưởng nhà trường.
2. Thư ký: Ông/Bà: [Họ tên Thư ký Hội đồng] - Chức vụ: Giáo viên / Thư ký.
3. Đại biểu tham dự: Toàn thể cán bộ, giáo viên, nhân viên nhà trường (Có mặt: [CẦN BỔ SUNG: ...], Vắng mặt: [CẦN BỔ SUNG: ...]).

II. NỘI DUNG CUỘC HỌP
1. Đồng chí Hiệu trưởng đánh giá công tác tháng qua:
- Đánh giá việc duy trì nền nếp dạy và học, công tác kiểm tra nội bộ và hoạt động ngoài giờ lên lớp.
- Biểu dương các tổ chuyên môn hoàn thành đúng tiến độ kế hoạch bài dạy.
2. Ý kiến thảo luận của các thành viên:
- Đại diện Tổ Khoa học Tự nhiên và Tổ Khoa học Xã hội phát biểu đóng góp về công tác đổi mới kiểm tra đánh giá.
- Tổ Văn phòng báo cáo công tác quản lý văn thư và kinh phí hoạt động.

III. KẾT LUẬN VÀ BIỂU QUYẾT
1. Thống nhất 100% các chỉ tiêu công tác chuyên môn trong tháng tiếp theo.
2. Giao nhiệm vụ cho các bộ phận triển khai đúng kế hoạch.

Biên bản được đọc lại cho toàn thể cuộc họp cùng nghe, nhất trí thông qua và ký tên./.`,
      };
    }

    case 'giay_moi': {
      return {
        title: `GIẤY MỜI\n${prompt ? prompt.toUpperCase() : 'THAM DỰ HỘI NGHỊ HỌP BAN ĐẠI DIỆN CHA MẸ HỌC SINH ĐẦU NĂM HỌC'}`,
        docNumber: `…/GM-${codePrefix}`,
        subject: prompt ? `Giấy mời ${prompt}` : 'Giấy mời tham dự Hội nghị đại biểu Cha mẹ học sinh',
        signerPosition: 'HIỆU TRƯỞNG',
        signerName: principalName,
        recipients: 'Như Kính gửi; BGH; GVCN các lớp; Lưu: VT.',
        content: `Kính gửi: Ông/Bà [Họ tên đại biểu / Phụ huynh học sinh].

Ban Giám hiệu Trường ${schoolName} trân trọng kính mời Ông/Bà:
- Tới tham dự: [CẦN BỔ SUNG: Tên chương trình / Hội nghị].
- Thời gian: Vào hồi [CẦN BỔ SUNG: 08 giờ 00, Chủ Nhật ngày dd/mm/yyyy].
- Địa điểm: Hội trường tầng 2, Trường ${schoolName} (Địa chỉ: ${schoolProfile.address || '[Địa chỉ trường]'}).

Nội dung chính của buổi làm việc:
1. Thông qua Báo cáo phương hướng nhiệm vụ năm học và các chỉ tiêu phấn đấu.
2. Thảo luận các biện pháp phối hợp giữa Gia đình - Nhà trường - Xã hội trong quản lý và giáo dục học sinh.
3. Kiện toàn Ban đại diện Cha mẹ học sinh theo Thông tư số 55/2011/TT-BGDĐT.

Sự hiện diện đầy đủ và đúng giờ của Quý đại biểu là niềm vinh hạnh to lớn và góp phần quyết định thành công của Hội nghị.

Rất mong Quý đại biểu thu xếp thời gian tham dự!`,
      };
    }

    default: {
      return {
        title: `VĂN BẢN HÀNH CHÍNH\n${prompt ? prompt.toUpperCase() : 'TRIỂN KHAI NHIỆM VỤ NĂM HỌC'}`,
        docNumber: `…/VB-${codePrefix}`,
        subject: prompt ? `V/v ${prompt}` : 'V/v triển khai thực hiện nhiệm vụ công tác trường học',
        signerPosition: 'HIỆU TRƯỞNG',
        signerName: principalName,
        recipients: 'Như trên; Ban Giám hiệu; Lưu: VT.',
        content: `Căn cứ Luật Giáo dục số 43/2019/QH14 ngày 14 tháng 6 năm 2019;
Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;
Căn cứ chức năng, nhiệm vụ và quyền hạn của Trường ${schoolName};

Nhà trường hướng dẫn và yêu cầu triển khai các nội dung sau:

1. Mục đích và yêu cầu:
- Nâng cao tinh thần trách nhiệm, kỷ cương, tình thương và trách nhiệm của cán bộ quản lý và đội ngũ nhà giáo.
- Thực hiện nghiêm túc quy chế dân chủ ở cơ sở và các văn bản chỉ đạo của cấp trên.

2. Nội dung thực hiện cụ thể:
- Cán bộ, giáo viên, nhân viên căn cứ nhiệm vụ được phân công xây dựng kế hoạch cá nhân chi tiết.
- Tăng cường ứng dụng công nghệ thông tin và chuyển đổi số trong quản trị hồ sơ và hoạt động sư phạm.

3. Tổ chức thực hiện:
- Đề nghị các tổ chức đoàn thể, các tổ chuyên môn và cá nhân có liên quan nghiêm túc triển khai thực hiện./.`,
      };
    }
  }
}
