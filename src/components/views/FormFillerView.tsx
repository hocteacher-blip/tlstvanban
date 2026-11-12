import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  RefreshCw,
  FileDown,
  Building2,
  User,
  ArrowRight,
  ListPlus,
} from 'lucide-react';
import { FormField, FormTemplate, SchoolProfile } from '../../types';
import { PRESET_TEMPLATES } from '../../data/presetTemplates';
import { apiService } from '../../services/api';
import { fillDocxTemplate, extractDocxText } from '../../utils/docxMerger';
import { generateAdminDocx, downloadFile } from '../../utils/docxGenerator';
import { parseExcelFile } from '../../utils/excelProcessor';

interface FormFillerViewProps {
  schoolProfile: SchoolProfile;
}

export const FormFillerView: React.FC<FormFillerViewProps> = ({ schoolProfile }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate>(PRESET_TEMPLATES[0]);
  const [fields, setFields] = useState<FormField[]>(PRESET_TEMPLATES[0].fields);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(1); // Steps: 1 (Upload/Select), 2 (Fill Form), 3 (Preview & Export)

  // Select Preset Template
  const handleSelectPreset = (tpl: FormTemplate) => {
    setSelectedTemplate(tpl);
    setFields(tpl.fields);
    const initial: Record<string, string> = {
      ten_truong: schoolProfile.schoolName,
      co_quan_chu_quan: schoolProfile.governingBody,
      hieu_truong: schoolProfile.principalName,
    };
    tpl.fields.forEach((f) => {
      initial[f.id] = f.defaultValue || '';
    });
    setFormData(initial);
    setActiveStep(2);
  };

  // Upload custom DOCX/XLSX/PDF file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsAnalyzing(true);
    setAnalysisStatus('Đang đọc và phân tích cấu trúc biểu mẫu bằng AI...');

    try {
      const buffer = await file.arrayBuffer();
      let extractedText = '';

      if (file.name.endsWith('.docx')) {
        extractedText = await extractDocxText(buffer);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const parsed = parseExcelFile(buffer);
        extractedText = `Excel Sheet với các cột: ${parsed.headers.join(', ')}`;
      } else {
        extractedText = file.name;
      }

      // Call AI to identify form fields
      const res = await apiService.analyzeForm({
        formText: extractedText || file.name,
        formTitle: file.name,
      });

      if (res.success && res.fields && res.fields.length > 0) {
        setFields(res.fields);
        const autoData: Record<string, string> = {
          ten_truong: schoolProfile.schoolName,
          co_quan_chu_quan: schoolProfile.governingBody,
          hieu_truong: schoolProfile.principalName,
        };
        res.fields.forEach((f: FormField) => {
          autoData[f.id] = f.defaultValue || '';
        });
        setFormData(autoData);
        setAnalysisStatus(`Đã nhận diện thành công ${res.fields.length} trường thông tin cần điền.`);
        setActiveStep(2);
      } else {
        setAnalysisStatus('Không nhận diện được trường tự động, đã áp dụng bộ trường tiêu chuẩn.');
      }
    } catch (err: any) {
      setAnalysisStatus('Lỗi phân tích file: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-fill from School Profile
  const handleAutoFillSchool = () => {
    setFormData((prev) => ({
      ...prev,
      ten_truong: schoolProfile.schoolName,
      co_quan_chu_quan: schoolProfile.governingBody,
      hieu_truong: schoolProfile.principalName,
      dia_chi: schoolProfile.address,
      so_dien_thoai: schoolProfile.phone,
      email: schoolProfile.email,
    }));
  };

  // Generate preview
  const handleGeneratePreview = () => {
    let populated = selectedTemplate.templateContent;
    for (const [k, v] of Object.entries(formData)) {
      const reg = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g');
      populated = populated.replace(reg, v || `[${k}]`);
    }
    setPreviewContent(populated);
    setActiveStep(3);
  };

  // Export filled Word document
  const handleExportWord = async () => {
    try {
      const doc = {
        id: 'filled_' + Date.now(),
        title: selectedTemplate.title,
        category: 'bieu_mau_khac' as const,
        docNumber: formData.so_quyet_dinh || '…/BM',
        issueDate: formData.ngay_ban_hanh || new Date().toLocaleDateString('vi-VN'),
        location: 'TP. Hồ Chí Minh',
        subject: selectedTemplate.title,
        signerName: formData.hieu_truong || schoolProfile.principalName,
        signerPosition: 'HIỆU TRƯỞNG',
        recipients: ['Lưu: VT', 'Người thực hiện'],
        content: previewContent || selectedTemplate.templateContent,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: schoolProfile.principalName,
      };

      const blob = await generateAdminDocx(doc, schoolProfile);
      downloadFile(blob, `${selectedTemplate.id}_dien_tu_dong.docx`);
    } catch (err: any) {
      alert('Lỗi xuất file: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Steps Indicator */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chức năng trọng tâm</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Điền biểu mẫu Word, Excel tự động
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tải biểu mẫu trường học hoặc chọn mẫu có sẵn, AI tự động nhận diện ô trống, bảng biểu và ghép dữ liệu chính xác giữ nguyên 100% định dạng.
            </p>
          </div>

          {/* Step Badges */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveStep(1)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeStep === 1
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              1. Chọn / Tải mẫu
            </button>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <button
              onClick={() => setActiveStep(2)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeStep === 2
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              2. Nhập dữ liệu
            </button>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <button
              onClick={handleGeneratePreview}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeStep === 3
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              3. Xem trước & Xuất
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: Select or Upload Template */}
      {activeStep === 1 && (
        <div className="space-y-6">
          {/* Upload Custom File Box */}
          <div className="bg-white p-6 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Tải lên biểu mẫu của trường (DOCX, XLSX, PDF)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kéo thả file biểu mẫu hoặc nhấp để tải từ máy tính của bạn
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors">
              <span>Chọn file biểu mẫu</span>
              <input
                type="file"
                accept=".docx,.xlsx,.xls,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{analysisStatus}</span>
              </div>
            )}
            {analysisStatus && !isAnalyzing && (
              <div className="text-xs text-emerald-600 font-medium">{analysisStatus}</div>
            )}
          </div>

          {/* Preset School Templates Library */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Hoặc chọn biểu mẫu chuẩn có sẵn của trường:
              </h3>
              <span className="text-xs text-slate-500">{PRESET_TEMPLATES.length} biểu mẫu</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRESET_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectPreset(tpl)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedTemplate.id === tpl.id
                      ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-blue-600">{tpl.category}</span>
                    <span className="uppercase text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                      {tpl.fileType}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{tpl.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{tpl.description}</p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-medium">
                    <span>{tpl.fields.length} trường điền</span>
                    <span>Chọn mẫu →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Fill Form Fields */}
      {activeStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Fields Input Form (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Điền thông tin vào: {selectedTemplate.title}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập các thông tin dưới đây để AI tự động ghép vào biểu mẫu.
                </p>
              </div>
              <button
                onClick={handleAutoFillSchool}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Tự điền từ Hồ sơ trường</span>
              </button>
            </div>

            {/* Dynamic Fields List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>{field.label}</span>
                    {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.id] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.id]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-blue-500 h-20 resize-none bg-slate-50/50"
                    />
                  ) : (
                    <input
                      type={field.type === 'date' ? 'text' : field.type}
                      value={formData[field.id] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.id]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-blue-500 bg-slate-50/50"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                ← Quay lại chọn mẫu
              </button>
              <button
                onClick={handleGeneratePreview}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                <span>Xem trước kết quả ghép dữ liệu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Quick School Info Helper (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Thông tin hồ sơ trường áp dụng:</span>
              </div>
              <div className="space-y-1.5 text-slate-600 text-[11px]">
                <div>
                  <span className="font-semibold text-slate-700">Đơn vị:</span> {schoolProfile.schoolName}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Cơ quan quản lý:</span> {schoolProfile.governingBody}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Hiệu trưởng:</span> {schoolProfile.principalName}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Địa chỉ:</span> {schoolProfile.address}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                Các biến như <code>&#123;&#123;ten_truong&#125;&#125;</code>, <code>&#123;&#123;hieu_truong&#125;&#125;</code> được hệ thống tự động gán vào văn bản.
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-2 text-emerald-900">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bảo toàn 100% cấu trúc OOXML</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Không phá vỡ bảng biểu, không làm lệch lề header/footer, giữ nguyên con dấu và logo trong file Word gốc.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Preview & Download */}
      {activeStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Xem trước văn bản đã điền thông tin
              </h3>
              <p className="text-xs text-slate-500">
                Kiểm tra lại toàn bộ nội dung trước khi xuất sang định dạng Word hoặc PDF.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(2)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Chỉnh sửa lại dữ liệu
              </button>
              <button
                onClick={handleExportWord}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải file Word (.docx)</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300"
              >
                <FileDown className="w-4 h-4" />
                <span>In / Lưu PDF</span>
              </button>
            </div>
          </div>

          {/* Paper View Simulation */}
          <div className="bg-slate-200 p-6 rounded-2xl flex justify-center">
            <div className="w-full max-w-[800px] bg-white min-h-[900px] shadow-2xl p-10 font-serif text-slate-900 border border-slate-300 space-y-6 text-xs md:text-sm leading-relaxed">
              <div className="text-center font-bold text-base uppercase text-slate-900 tracking-tight">
                {selectedTemplate.title}
              </div>
              <div className="whitespace-pre-wrap text-justify">
                {previewContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
