import React, { useState } from 'react';
import {
  FolderSync,
  Upload,
  Copy,
  Download,
  CheckCircle2,
  Sparkles,
  ArrowRightLeft,
  FileText,
  FileCheck,
} from 'lucide-react';
import { convertTcvn3ToUnicode, convertVniToUnicode, cleanDocumentText } from '../../utils/fontConverter';
import { downloadFile } from '../../utils/docxGenerator';

export const FontConverterView: React.FC = () => {
  const [sourceEncoding, setSourceEncoding] = useState<'tcvn3' | 'vni' | 'clean'>('tcvn3');
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleConvert = () => {
    let result = '';
    if (sourceEncoding === 'tcvn3') {
      result = convertTcvn3ToUnicode(inputText);
    } else if (sourceEncoding === 'vni') {
      result = convertVniToUnicode(inputText);
    } else {
      result = cleanDocumentText(inputText);
    }
    setOutputText(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText || inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const handleDownloadText = () => {
    const blob = new Blob([outputText || inputText], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, 'van_ban_da_chuyen_doi_unicode.txt');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-1">
            <FolderSync className="w-3.5 h-3.5 text-teal-600" />
            <span>Xử lý phông chữ & Làm sạch văn bản giáo dục</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Chuyển đổi phông chữ TCVN3 / VNI sang Unicode & Làm sạch định dạng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Khắc phục triệt để lỗi phông chữ cổ (.VnTime, VNI-Times) trong các văn bản, thông tư, giáo án cũ của ngành giáo dục, chuyển đổi tức thì sang Unicode dựng sẵn.
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Bộ mã nguồn:</label>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSourceEncoding('tcvn3')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                sourceEncoding === 'tcvn3'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              TCVN3 (ABC, .VnTime, .VnTimeH)
            </button>
            <button
              onClick={() => setSourceEncoding('vni')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                sourceEncoding === 'vni'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              VNI (VNI-Times)
            </button>
            <button
              onClick={() => setSourceEncoding('clean')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                sourceEncoding === 'clean'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Làm sạch lỗi định dạng
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Tải file văn bản (.txt)</span>
            <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={handleConvert}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Chuyển đổi ngay</span>
          </button>
        </div>
      </div>

      {/* 2 Panels: Input (Left) & Converted Unicode (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Textarea */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Văn bản gốc (lỗi phông):</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {inputText.length} ký tự
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Dán văn bản bị lỗi font vào đây..."
            className="w-full h-[420px] p-3 text-xs leading-relaxed border border-slate-200 rounded-lg bg-slate-50 font-mono focus:outline-blue-500 focus:bg-white resize-none"
          />
        </div>

        {/* Output Textarea */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Kết quả Unicode chuẩn (Times New Roman):</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
              <button
                onClick={handleDownloadText}
                className="flex items-center gap-1 text-xs text-slate-600 font-semibold hover:text-slate-900"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file</span>
              </button>
            </div>
          </div>
          <textarea
            value={outputText}
            readOnly
            placeholder="Kết quả sau khi chuyển đổi sẽ hiển thị tại đây..."
            className="w-full h-[420px] p-3 text-xs md:text-sm leading-relaxed border border-slate-200 rounded-lg bg-emerald-50/20 font-serif focus:outline-blue-500 resize-none text-slate-900"
          />
        </div>
      </div>
    </div>
  );
};
