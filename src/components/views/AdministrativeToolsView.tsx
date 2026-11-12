import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  FileCheck,
  RefreshCw,
  GitCompare,
  Table,
  FileSpreadsheet,
  Download,
  Copy,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { exportToExcel } from '../../utils/excelProcessor';

export const AdministrativeToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'check_format' | 'compare' | 'table_converter'>('check_format');

  // Tool 1: Check Decree 30 Format
  const [docContent, setDocContent] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<{
    score: number;
    summary: string;
    passItems: string[];
    issues: { element: string; current: string; suggestion: string }[];
    improvedVersion?: string;
  } | null>(null);

  // Tool 2: Compare 2 Versions
  const [docV1, setDocV1] = useState<string>('');
  const [docV2, setDocV2] = useState<string>('');
  const [diffAnalysis, setDiffAnalysis] = useState<string>('');
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Tool 3: Table converter
  const [markdownTable, setMarkdownTable] = useState<string>('');

  const handleAuditFormat = async () => {
    setIsAuditing(true);
    try {
      const res = await apiService.checkFormat({
        documentContent: docContent,
        documentType: 'Thông báo / Công văn hành chính',
      });
      if (res.success && res.report) {
        setAuditReport(res.report);
      } else {
        alert('Lỗi kiểm tra: ' + (res.error || 'Vui lòng kiểm tra lại'));
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCompareDocs = async () => {
    setIsComparing(true);
    try {
      const prompt = `So sánh chi tiết 2 phiên bản văn bản sau đây và chỉ ra điểm khác biệt cốt lõi (bổ sung, sửa đổi, bãi bỏ):
Bản 1 (cũ):
"""${docV1}"""

Bản 2 (mới):
"""${docV2}"""

Phân tích bằng tiếng Việt rõ ràng, dạng gạch đầu dòng và bảng so sánh.`;

      const res = await apiService.generateText({ prompt });
      if (res.success && res.text) {
        setDiffAnalysis(res.text);
      }
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsComparing(false);
    }
  };

  const handleExportTableExcel = () => {
    try {
      const lines = markdownTable.split('\n').filter((l) => l.trim().startsWith('|'));
      if (lines.length < 2) {
        alert('Dữ liệu bảng markdown chưa đúng định dạng!');
        return;
      }
      const headers = lines[0].split('|').map((c) => c.trim()).filter(Boolean);
      const rows = lines.slice(2).map((line) => {
        const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cells[idx] || '';
        });
        return rowObj;
      });
      exportToExcel(rows, 'Bang_Du_Lieu_Word_To_Excel');
    } catch (err: any) {
      alert('Lỗi xuất Excel: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-1">
            <Wrench className="w-3.5 h-3.5 text-sky-600" />
            <span>Bộ tiện ích quản trị số</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Công cụ AI bổ trợ hành chính & kiểm tra thể thức
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm tra thể thức chuẩn Nghị định 30/2020, so sánh đối chiếu hai bản thảo, trích xuất bảng Word sang Excel.
          </p>
        </div>
      </div>

      {/* Tool Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTool('check_format')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTool === 'check_format'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Kiểm tra thể thức Nghị định 30</span>
        </button>

        <button
          onClick={() => setActiveTool('compare')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTool === 'compare'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>So sánh văn bản cũ & mới</span>
        </button>

        <button
          onClick={() => setActiveTool('table_converter')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTool === 'table_converter'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Chuyển bảng Word sang Excel</span>
        </button>
      </div>

      {/* TOOL 1: Decree 30 Auditor */}
      {activeTool === 'check_format' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input text */}
          <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Nhập hoặc dán văn bản cần kiểm tra thể thức:
              </span>
              <button
                onClick={handleAuditFormat}
                disabled={isAuditing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isAuditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Kiểm tra thể thức AI</span>
              </button>
            </div>

            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Dán hoặc nhập nội dung văn bản (công văn, quyết định, thông báo, kế hoạch) để AI kiểm định thể thức theo Nghị định 30/2020..."
              className="w-full h-[450px] p-3 text-xs leading-relaxed border border-slate-200 rounded-lg bg-slate-50 font-serif focus:outline-blue-500 focus:bg-white resize-none"
            />
          </div>

          {/* Audit Results Panel */}
          <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <span className="text-xs font-bold text-slate-900">
                Kết quả kiểm định thể thức (NĐ 30/2020/NĐ-CP):
              </span>
              {auditReport && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Điểm chuẩn hóa:</span>
                  <span className={`text-base font-bold px-2.5 py-0.5 rounded-full ${
                    auditReport.score >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {auditReport.score}/100
                  </span>
                </div>
              )}
            </div>

            {!auditReport ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3 min-h-[350px]">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Scale className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-700">Chưa có kết quả kiểm tra</div>
                <p className="text-xs text-slate-500 max-w-sm">
                  Dán nội dung công văn, quyết định, thông báo ở bảng bên trái và nhấp "Kiểm tra thể thức AI" để nhận bản đánh giá chi tiết theo Nghị định 30/2020.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs max-h-[440px] overflow-y-auto pr-1">
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700">
                  <span className="font-bold text-slate-900">Đánh giá chung:</span> {auditReport.summary}
                </div>

                {/* Passed items */}
                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Thành phần đạt chuẩn ({auditReport.passItems.length}):</span>
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {auditReport.passItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Issues and suggestions */}
                <div className="space-y-2">
                  <span className="font-bold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Điểm cần khắc phục theo quy định ({auditReport.issues.length}):</span>
                  </span>
                  {auditReport.issues.map((iss, idx) => (
                    <div key={idx} className="p-2.5 border border-amber-200 bg-amber-50/40 rounded-lg space-y-1">
                      <div className="font-bold text-slate-900">{iss.element}</div>
                      <div className="text-[11px] text-slate-500">
                        <span className="font-semibold text-rose-700">Hiện tại:</span> {iss.current}
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        <span className="font-semibold">Sửa đổi theo NĐ 30:</span> {iss.suggestion}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Improved Version */}
                {auditReport.improvedVersion && (
                  <div className="pt-2 border-t space-y-2">
                    <span className="font-bold text-blue-900">Bản chuẩn hóa hoàn chỉnh:</span>
                    <pre className="p-3 bg-blue-50/40 border border-blue-200 rounded-lg text-[11px] font-serif whitespace-pre-wrap">
                      {auditReport.improvedVersion}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 2: Document Comparison */}
      {activeTool === 'compare' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800">Phiên bản gốc / Dự thảo 1:</span>
              <textarea
                value={docV1}
                onChange={(e) => setDocV1(e.target.value)}
                className="w-full h-44 p-3 text-xs border border-slate-300 rounded-lg bg-slate-50 font-serif"
              />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800">Phiên bản sửa đổi / Dự thảo 2:</span>
              <textarea
                value={docV2}
                onChange={(e) => setDocV2(e.target.value)}
                className="w-full h-44 p-3 text-xs border border-slate-300 rounded-lg bg-slate-50 font-serif"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleCompareDocs}
              disabled={isComparing}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              {isComparing ? 'AI đang đối chiếu...' : 'So sánh & Tìm điểm khác biệt'}
            </button>
          </div>

          {diffAnalysis && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <span className="font-bold text-slate-900">Báo cáo so sánh điểm khác biệt:</span>
              <div className="p-4 bg-slate-50 rounded-lg whitespace-pre-wrap leading-relaxed font-serif">
                {diffAnalysis}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 3: Word Table to Excel */}
      {activeTool === 'table_converter' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Chuyển bảng biểu từ Word / Markdown sang file Excel (.xlsx)
              </h3>
              <p className="text-xs text-slate-500">
                Dán bảng dữ liệu copy từ văn bản Word hoặc định dạng markdown để trích xuất ngay file Excel.
              </p>
            </div>
            <button
              onClick={handleExportTableExcel}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Xuất file Excel (.xlsx)</span>
            </button>
          </div>

          <textarea
            value={markdownTable}
            onChange={(e) => setMarkdownTable(e.target.value)}
            className="w-full h-56 p-3 text-xs border border-slate-300 rounded-lg font-mono bg-slate-50"
          />
        </div>
      )}
    </div>
  );
};
