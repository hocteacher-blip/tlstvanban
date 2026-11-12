import React, { useState, useRef } from 'react';
import {
  ScanText,
  Upload,
  Camera,
  FileText,
  Download,
  Sparkles,
  Table,
  CheckCircle2,
  RefreshCw,
  Copy,
  ArrowRight,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { generateAdminDocx, downloadFile } from '../../utils/docxGenerator';
import { SchoolProfile } from '../../types';

interface OcrViewProps {
  schoolProfile: SchoolProfile;
  onSendToDrafting: (text: string) => void;
}

export const OcrView: React.FC<OcrViewProps> = ({ schoolProfile, onSendToDrafting }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [ocrMode, setOcrMode] = useState<'full' | 'text_only' | 'table_only'>('full');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/png');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64 = result.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  // Run AI OCR
  const handleRunOcr = async () => {
    if (!imageBase64) {
      alert('Vui lòng tải lên hình ảnh hoặc chụp ảnh công văn trước!');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await apiService.performOcr({
        imageData: imageBase64,
        mimeType,
        mode: ocrMode,
      });

      if (res.success && res.content) {
        setOcrResult(res.content);
      } else {
        alert('Lỗi nhận diện OCR: ' + (res.error || 'Vui lòng kiểm tra lại hình ảnh'));
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export to Word
  const handleExportWord = async () => {
    const doc = {
      id: 'ocr_' + Date.now(),
      title: 'VĂN BẢN ĐƯỢC CHUYỂN TỪ ẢNH / PDF',
      category: 'bieu_mau_khac' as const,
      docNumber: '…/OCR',
      issueDate: new Date().toLocaleDateString('vi-VN'),
      location: 'TP. Hồ Chí Minh',
      subject: 'Văn bản chuyển đổi từ OCR',
      signerName: schoolProfile.principalName,
      signerPosition: 'HIỆU TRƯỞNG',
      recipients: ['Lưu: VT'],
      content: ocrResult,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'SCHOOL DOC AI OCR',
    };

    try {
      const blob = await generateAdminDocx(doc, schoolProfile);
      downloadFile(blob, 'Van_ban_OCR_chuyen_doi.docx');
    } catch (err: any) {
      alert('Lỗi xuất Word: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-1">
            <ScanText className="w-3.5 h-3.5 text-amber-600" />
            <span>OCR Tiếng Việt & Tái tạo bảng biểu chuyên sâu</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Chuyển ảnh, PDF công văn sang Word có thể chỉnh sửa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhận diện chính xác văn bản hành chính tiếng Việt, phục hồi bảng số liệu, con dấu, chữ ký và chuyển thành file Word (.docx) chuẩn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSendToDrafting(ocrResult)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors"
          >
            <span>Đưa vào Trợ lý soạn thảo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải file Word (.docx)</span>
          </button>
        </div>
      </div>

      {/* Grid: Image input (Left 5 cols) & OCR result (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Options */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upload Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-800">1. Tải ảnh hoặc chụp công văn:</span>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer bg-amber-50/20 transition-all"
            >
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-60 mx-auto rounded shadow-xs object-contain"
                  />
                  <p className="text-[11px] text-slate-500">Nhấp để chọn ảnh khác</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    Tải ảnh công văn (JPG, PNG) hoặc PDF
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Hỗ trợ ảnh chụp từ điện thoại, bản scan
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* OCR Mode Options */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">2. Chế độ xử lý:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setOcrMode('full')}
                  className={`p-2 rounded-lg border text-center font-medium transition-all ${
                    ocrMode === 'full'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Giữ bố cục & bảng
                </button>
                <button
                  type="button"
                  onClick={() => setOcrMode('table_only')}
                  className={`p-2 rounded-lg border text-center font-medium transition-all ${
                    ocrMode === 'table_only'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Trích xuất bảng biểu
                </button>
                <button
                  type="button"
                  onClick={() => setOcrMode('text_only')}
                  className={`p-2 rounded-lg border text-center font-medium transition-all ${
                    ocrMode === 'text_only'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Văn bản thuần túy
                </button>
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleRunOcr}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang quét ký tự & phục hồi cấu trúc...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Nhận dạng OCR & chuyển sang Word</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: OCR Result Editor */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Văn bản đã nhận diện (Có thể chỉnh sửa trực tiếp)
              </h3>
              <p className="text-xs text-slate-500">
                Toàn bộ chữ có dấu, tiêu đề và bảng số liệu đã được trích xuất chính xác.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(ocrResult);
                alert('Đã sao chép nội dung văn bản!');
              }}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 font-medium"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép</span>
            </button>
          </div>

          <textarea
            value={ocrResult}
            onChange={(e) => setOcrResult(e.target.value)}
            placeholder="Nội dung văn bản nhận diện được từ hình ảnh hoặc PDF scan sẽ hiển thị tại đây... Bạn có thể trực tiếp chỉnh sửa và xuất file Word."
            className="w-full h-[520px] p-4 text-xs md:text-sm leading-relaxed border border-slate-200 rounded-xl bg-slate-50 font-serif focus:outline-blue-500 focus:bg-white resize-none"
          />
        </div>
      </div>
    </div>
  );
};
