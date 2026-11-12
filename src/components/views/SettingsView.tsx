import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Shield,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Coins,
  Cpu,
} from 'lucide-react';
import { db } from '../../services/db';

interface SettingsViewProps {
  apiStatus: { ok: boolean; message: string };
  onRefreshHealth: () => void;
  onDataRestored: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  apiStatus,
  onRefreshHealth,
  onDataRestored,
}) => {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleExportBackup = () => {
    setIsBackingUp(true);
    try {
      const json = db.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SCHOOL_DOC_AI_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const success = db.restoreBackup(content);
      if (success) {
        alert('Khôi phục dữ liệu hệ thống thành công!');
        onDataRestored();
      } else {
        alert('File sao lưu không hợp lệ hoặc bị lỗi!');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu để đưa hệ thống về trạng thái trắng ban đầu?')) {
      localStorage.clear();
      onDataRestored();
      alert('Đã xóa toàn bộ dữ liệu thành công!');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-1">
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Cấu hình hệ thống & Bảo mật dữ liệu</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Cài đặt AI, Quản lý tài nguyên & Sao lưu dữ liệu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi trạng thái mô hình Google Gemini, cơ chế bảo vệ thông tin sư phạm và quản lý bản sao lưu hồ sơ trường học.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gemini AI Status & Cost Management */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Hệ thống AI & Mô hình Gemini</span>
            </h3>
            <button
              onClick={onRefreshHealth}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kiểm tra kết nối</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Trạng thái kết nối API:</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {apiStatus.ok ? 'Kết nối máy chủ an toàn phía backend (Proxy API)' : apiStatus.message}
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                  apiStatus.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {apiStatus.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{apiStatus.ok ? 'Hoạt động' : 'Chờ thiết lập'}</span>
              </span>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-800">Phân định mô hình cho từng tác vụ:</div>
              <ul className="space-y-1.5 text-slate-600 text-[11px]">
                <li className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span>Soạn thảo văn bản & Điền mẫu:</span>
                  <span className="font-mono font-bold text-blue-700">gemini-3.8-flash</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span>OCR ảnh / PDF công văn:</span>
                  <span className="font-mono font-bold text-blue-700">gemini-3.8-flash (Multimodal)</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span>Xử lý âm thanh & Lập biên bản:</span>
                  <span className="font-mono font-bold text-blue-700">gemini-3.8-flash / transcribe</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span>Hỏi đáp kho văn bản pháp luật:</span>
                  <span className="font-mono font-bold text-blue-700">gemini-3.8-flash</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-blue-600" />
                <span>Cơ chế tiết kiệm tài nguyên & bảo mật</span>
              </div>
              <p>
                API Key được lưu trữ hoàn toàn tại biến môi trường phía server, không bao giờ lộ ra trình duyệt. Hệ thống chỉ gửi phần văn bản cần xử lý để tối ưu thời gian phản hồi và hạn ngạch.
              </p>
            </div>
          </div>
        </div>

        {/* Local Storage & Backup / Restore */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-3 border-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Lưu trữ nội bộ & Sao lưu hồ sơ trường học</span>
          </h3>

          <div className="space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Dữ liệu trường học (Hồ sơ đơn vị, danh sách cán bộ giáo viên, văn bản đi đến, biên bản cuộc họp) được bảo mật lưu trữ tại trình duyệt của bạn (IndexedDB / LocalStorage) độc lập, không chia sẻ ra ngoài trường.
            </p>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleExportBackup}
                disabled={isBackingUp}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Sao lưu toàn bộ dữ liệu ra file JSON</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 p-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Khôi phục dữ liệu từ file sao lưu</span>
                <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
              </label>

              <button
                onClick={handleResetDefaults}
                className="w-full flex items-center justify-center gap-2 p-2 text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors cursor-pointer text-[11px]"
              >
                Xóa toàn bộ dữ liệu & đưa về trạng thái trắng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
