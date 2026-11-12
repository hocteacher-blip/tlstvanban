import React, { useState } from 'react';
import {
  Files,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Archive,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles,
} from 'lucide-react';
import { FormTemplate, SchoolProfile } from '../../types';
import { PRESET_TEMPLATES } from '../../data/presetTemplates';
import { parseExcelFile, validateExcelData, exportToExcel } from '../../utils/excelProcessor';
import { generateAdminDocx, downloadFile } from '../../utils/docxGenerator';
import JSZip from 'jszip';

interface BatchMergeViewProps {
  schoolProfile: SchoolProfile;
}

export const BatchMergeView: React.FC<BatchMergeViewProps> = ({ schoolProfile }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate>(PRESET_TEMPLATES[0]);
  const [excelRows, setExcelRows] = useState<Record<string, any>[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergeProgress, setMergeProgress] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    missingCells: { rowIndex: number; column: string }[];
    duplicateKeys: { key: string; rowIndices: number[] }[];
  } | null>(null);

  // Field mapping state: templateFieldId -> excelHeader
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Handle Excel file upload
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const parsed = parseExcelFile(buffer);
        setExcelRows(parsed.rows);
        setExcelHeaders(parsed.headers);
        setPreviewIndex(0);

        // Auto map columns
        const newMapping: Record<string, string> = {};
        selectedTemplate.fields.forEach((f) => {
          const match = parsed.headers.find(
            (h) =>
              h.toLowerCase().includes(f.label.toLowerCase()) ||
              f.label.toLowerCase().includes(h.toLowerCase())
          );
          if (match) newMapping[f.id] = match;
        });
        setColumnMapping(newMapping);
      } catch (err: any) {
        alert('Lỗi đọc file Excel: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Run validation
  const handleValidate = () => {
    const required = ['Họ tên'];
    const result = validateExcelData(excelRows, required, 'Họ tên');
    setValidationResult(result);
  };

  // Generate populated text for a specific row index
  const renderPopulatedContent = (rowIndex: number): string => {
    if (!excelRows[rowIndex]) return '';
    const row = excelRows[rowIndex];
    let content = selectedTemplate.templateContent;

    content = content.replace(/\{\{\s*ten_truong\s*\}\}/g, schoolProfile.schoolName);
    content = content.replace(/\{\{\s*hieu_truong\s*\}\}/g, schoolProfile.principalName);

    for (const field of selectedTemplate.fields) {
      const mappedHeader = columnMapping[field.id];
      const val = mappedHeader && row[mappedHeader] !== undefined ? String(row[mappedHeader]) : (row[field.label] || `[${field.label}]`);
      const reg = new RegExp(`\\{\\{\\s*${field.id}\\s*\\}\\}`, 'g');
      content = content.replace(reg, val);
    }
    return content;
  };

  // Batch Export all records as a downloadable ZIP package
  const handleBatchExportZip = async () => {
    if (excelRows.length === 0) {
      alert('Danh sách Excel không có dữ liệu để tạo văn bản!');
      return;
    }

    setIsMerging(true);
    setMergeProgress(0);

    try {
      const zip = new JSZip();

      for (let i = 0; i < excelRows.length; i++) {
        const row = excelRows[i];
        const personName = (row['Họ tên'] || row['HoTen'] || `BanGhi_${i + 1}`)
          .toString()
          .replace(/[/\\?%*:|"<>]/g, '_');

        const populatedContent = renderPopulatedContent(i);
        const doc = {
          id: `batch_${i + 1}`,
          title: selectedTemplate.title,
          category: 'quyet_dinh' as const,
          docNumber: row['Số quyết định'] || `142/QĐ-THCSND`,
          issueDate: new Date().toLocaleDateString('vi-VN'),
          location: 'TP. Hồ Chí Minh',
          subject: `${selectedTemplate.title} - ${personName}`,
          signerName: schoolProfile.principalName,
          signerPosition: 'HIỆU TRƯỞNG',
          recipients: ['Lưu: VT', personName],
          content: populatedContent,
          status: 'issued' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: schoolProfile.principalName,
        };

        const docBlob = await generateAdminDocx(doc, schoolProfile);
        const filename = `${String(i + 1).padStart(2, '0')}_${selectedTemplate.id}_${personName}.docx`;
        zip.file(filename, docBlob);

        setMergeProgress(Math.round(((i + 1) / excelRows.length) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, `Goi_Van_Ban_Hang_Loat_${excelRows.length}_ban.zip`);
    } catch (err: any) {
      alert('Lỗi tạo gói văn bản hàng loạt: ' + err.message);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-1">
            <Files className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ghép văn bản hàng loạt (Mail Merge)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tạo văn bản hàng loạt từ danh sách Excel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghép một mẫu Word với bảng tính Excel để tự động tạo từ 1 đến 1.000 quyết định phân công, giấy mời, giấy khen thành gói file ZIP hoàn chỉnh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToExcel(excelRows, 'Mau_Danh_Sach_Giao_Vien')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200"
            title="Tải file mẫu Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải mẫu Excel</span>
          </button>
          <button
            onClick={handleBatchExportZip}
            disabled={isMerging}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isMerging ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang xử lý ({mergeProgress}%)...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>Xuất tất cả ({excelRows.length} file ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2 Columns: Config & Column Mapping (Left) + Live Row Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Template & Excel upload */}
        <div className="lg:col-span-5 space-y-4">
          {/* Step A: Select Template */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <label className="text-xs font-bold text-slate-800">
              1. Chọn mẫu văn bản nguồn:
            </label>
            <select
              value={selectedTemplate.id}
              onChange={(e) => {
                const found = PRESET_TEMPLATES.find((t) => t.id === e.target.value);
                if (found) setSelectedTemplate(found);
              }}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium text-slate-800 focus:outline-blue-500"
            >
              {PRESET_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category})
                </option>
              ))}
            </select>
          </div>

          {/* Step B: Upload Excel or Use Sample Data */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                2. Bảng dữ liệu Excel ({excelRows.length} bản ghi):
              </span>
            </div>

            <label className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-blue-300 hover:border-blue-500 rounded-lg bg-blue-50/30 text-xs font-medium text-blue-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Tải file Excel (.xlsx, .xls)</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
              />
            </label>

            {/* Validation Trigger & Alert */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleValidate}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 underline"
              >
                Kiểm tra dữ liệu thiếu & trùng lặp
              </button>
              {validationResult && (
                <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                  validationResult.valid ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {validationResult.valid ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dữ liệu hợp lệ 100%</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Có ô trống hoặc trùng tên</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Step C: Column Mapping Review */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800">
              3. Khớp cột Excel với trường trong Word:
            </span>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {selectedTemplate.fields.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-xs gap-2">
                  <span className="font-medium text-slate-700 truncate w-1/2">
                    {f.label}:
                  </span>
                  <select
                    value={columnMapping[f.id] || ''}
                    onChange={(e) =>
                      setColumnMapping({ ...columnMapping, [f.id]: e.target.value })
                    }
                    className="w-1/2 text-xs border border-slate-200 rounded p-1 bg-slate-50 focus:outline-blue-500"
                  >
                    <option value="">-- Chọn cột Excel --</option>
                    {excelHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Live Row Preview & Record Navigation */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          {excelRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 min-h-[380px]">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa có danh sách dữ liệu Excel</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Vui lòng tải lên file Excel (.xlsx) chứa danh sách cán bộ, giáo viên hoặc học sinh ở bảng bên trái để ghép dữ liệu tự động.
              </p>
            </div>
          ) : (
            <>
              {/* Navigation Bar for Records */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Bản xem trước trực tiếp:
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    Bản ghi {previewIndex + 1} / {excelRows.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={previewIndex <= 0}
                    onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={previewIndex >= excelRows.length - 1}
                    onClick={() =>
                      setPreviewIndex((prev) => Math.min(excelRows.length - 1, prev + 1))
                    }
                    className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Current Row Excel Data Summary */}
              {excelRows[previewIndex] && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex flex-wrap gap-x-4 gap-y-1">
                  {Object.entries(excelRows[previewIndex]).map(([k, v]) => (
                    <div key={k} className="text-slate-600">
                      <span className="font-semibold text-slate-800">{k}:</span> {String(v)}
                    </div>
                  ))}
                </div>
              )}

              {/* Rendered Document View */}
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 font-serif text-xs md:text-sm leading-relaxed min-h-[380px] whitespace-pre-wrap">
                <div className="font-bold text-center text-sm md:text-base uppercase text-slate-900 mb-4">
                  {selectedTemplate.title}
                </div>
                {renderPopulatedContent(previewIndex)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
