import React, { useState } from 'react';
import {
  BookMarked,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  UserCheck,
} from 'lucide-react';
import { IncomingDispatch, OutgoingDispatch } from '../../types';
import { exportToExcel } from '../../utils/excelProcessor';

interface DispatchManagementViewProps {
  incomingList: IncomingDispatch[];
  outgoingList: OutgoingDispatch[];
  onAddIncoming: (item: IncomingDispatch) => void;
  onAddOutgoing: (item: OutgoingDispatch) => void;
}

export const DispatchManagementView: React.FC<DispatchManagementViewProps> = ({
  incomingList,
  outgoingList,
  onAddIncoming,
  onAddOutgoing,
}) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddIncomingModal, setShowAddIncomingModal] = useState<boolean>(false);
  const [showAddOutgoingModal, setShowAddOutgoingModal] = useState<boolean>(false);

  // New Incoming state
  const [newInc, setNewInc] = useState<Partial<IncomingDispatch>>({
    arrivalNumber: incomingList.length + 1,
    arrivalDate: new Date().toLocaleDateString('vi-VN'),
    docNumber: '',
    issueDate: new Date().toLocaleDateString('vi-VN'),
    issuingAuthority: '',
    summary: '',
    assignedTo: '',
    deadline: '',
    status: 'new',
    notes: '',
  });

  // New Outgoing state
  const [newOut, setNewOut] = useState<Partial<OutgoingDispatch>>({
    docNumber: '',
    issueDate: new Date().toLocaleDateString('vi-VN'),
    summary: '',
    drafter: '',
    reviewer: '',
    signer: '',
    recipients: 'Lưu: VT',
    status: 'approved',
  });

  const filteredIncoming = incomingList.filter((item) => {
    const matchSearch =
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredOutgoing = outgoingList.filter((item) => {
    const matchSearch =
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recipients.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const handleSaveIncoming = () => {
    if (!newInc.docNumber || !newInc.summary) {
      alert('Vui lòng nhập Số ký hiệu và Trích yếu văn bản đến!');
      return;
    }
    const item: IncomingDispatch = {
      id: 'inc_' + Date.now(),
      arrivalNumber: Number(newInc.arrivalNumber) || incomingList.length + 1,
      arrivalDate: newInc.arrivalDate || new Date().toLocaleDateString('vi-VN'),
      docNumber: newInc.docNumber,
      issueDate: newInc.issueDate || '',
      issuingAuthority: newInc.issuingAuthority || '',
      summary: newInc.summary,
      assignedTo: newInc.assignedTo || '',
      deadline: newInc.deadline || '',
      status: (newInc.status as any) || 'new',
      notes: newInc.notes,
    };
    onAddIncoming(item);
    setShowAddIncomingModal(false);
  };

  const handleSaveOutgoing = () => {
    if (!newOut.docNumber || !newOut.summary) {
      alert('Vui lòng nhập Số văn bản đi và Trích yếu!');
      return;
    }
    const item: OutgoingDispatch = {
      id: 'out_' + Date.now(),
      docNumber: newOut.docNumber,
      issueDate: newOut.issueDate || new Date().toLocaleDateString('vi-VN'),
      summary: newOut.summary,
      drafter: newOut.drafter || '',
      reviewer: newOut.reviewer || '',
      signer: newOut.signer || '',
      recipients: newOut.recipients || '',
      status: (newOut.status as any) || 'approved',
    };
    onAddOutgoing(item);
    setShowAddOutgoingModal(false);
  };

  const handleExportExcel = () => {
    if (activeTab === 'incoming') {
      const data = incomingList.map((i) => ({
        'Số đến': i.arrivalNumber,
        'Ngày đến': i.arrivalDate,
        'Số ký hiệu văn bản': i.docNumber,
        'Ngày ban hành': i.issueDate,
        'Cơ quan ban hành': i.issuingAuthority,
        'Trích yếu nội dung': i.summary,
        'Người xử lý': i.assignedTo,
        'Thời hạn xử lý': i.deadline,
        'Trạng thái': i.status,
      }));
      exportToExcel(data, 'So_Van_Ban_Den_2026');
    } else {
      const data = outgoingList.map((o) => ({
        'Số đi': o.docNumber,
        'Ngày ban hành': o.issueDate,
        'Trích yếu': o.summary,
        'Người soạn thảo': o.drafter,
        'Người duyệt': o.reviewer,
        'Người ký': o.signer,
        'Nơi nhận': o.recipients,
        'Trạng thái': o.status,
      }));
      exportToExcel(data, 'So_Van_Ban_Di_2026');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-1">
            <BookMarked className="w-3.5 h-3.5 text-teal-600" />
            <span>Sổ theo dõi văn thư số</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản lý văn bản Đi – Đến của nhà trường
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sổ văn thư điện tử chuẩn hóa theo quy định: vào sổ, phân công người xử lý, kiểm soát tiến độ hoàn thành và xuất báo cáo lưu trữ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất sổ Excel</span>
          </button>
          <button
            onClick={() =>
              activeTab === 'incoming'
                ? setShowAddIncomingModal(true)
                : setShowAddOutgoingModal(true)
            }
            className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'incoming' ? 'Thêm văn bản đến' : 'Thêm văn bản đi'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'incoming'
              ? 'border-teal-600 text-teal-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>SỔ VĂN BẢN ĐẾN</span>
          <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-[10px]">
            {incomingList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'outgoing'
              ? 'border-teal-600 text-teal-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>SỔ VĂN BẢN ĐI</span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">
            {outgoingList.length}
          </span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm số ký hiệu, trích yếu, cơ quan ban hành..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-teal-500"
          />
        </div>

        {activeTab === 'incoming' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="new">Mới tiếp nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Đã hoàn thành</option>
            </select>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'incoming' ? (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-16">Số đến</th>
                  <th className="py-3 px-3">Ngày đến</th>
                  <th className="py-3 px-3">Số ký hiệu</th>
                  <th className="py-3 px-3">Cơ quan ban hành</th>
                  <th className="py-3 px-3 max-w-xs">Trích yếu nội dung</th>
                  <th className="py-3 px-3">Người xử lý</th>
                  <th className="py-3 px-3">Thời hạn</th>
                  <th className="py-3 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncoming.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Chưa có văn bản đến nào trong sổ. Nhấp "Thêm văn bản đến" ở trên để ghi sổ mới.
                    </td>
                  </tr>
                ) : (
                  filteredIncoming.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-teal-700">{item.arrivalNumber}</td>
                      <td className="py-3 px-3 text-slate-600">{item.arrivalDate}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.docNumber}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{item.issuingAuthority}</td>
                      <td className="py-3 px-3 text-slate-800 font-medium max-w-xs">{item.summary}</td>
                      <td className="py-3 px-3 text-slate-600">{item.assignedTo}</td>
                      <td className="py-3 px-3 text-amber-700 font-medium">{item.deadline || '—'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'processing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status === 'completed'
                            ? 'Đã xử lý'
                            : item.status === 'processing'
                            ? 'Đang xử lý'
                            : 'Mới nhận'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Số đi</th>
                  <th className="py-3 px-3">Ngày ban hành</th>
                  <th className="py-3 px-3 max-w-xs">Trích yếu văn bản</th>
                  <th className="py-3 px-3">Người soạn</th>
                  <th className="py-3 px-3">Người duyệt</th>
                  <th className="py-3 px-3">Người ký</th>
                  <th className="py-3 px-3">Nơi nhận</th>
                  <th className="py-3 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOutgoing.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Chưa có văn bản đi nào trong sổ. Nhấp "Thêm văn bản đi" ở trên để ghi sổ mới.
                    </td>
                  </tr>
                ) : (
                  filteredOutgoing.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{item.docNumber}</td>
                      <td className="py-3 px-3 text-slate-600">{item.issueDate}</td>
                      <td className="py-3 px-3 text-slate-800 font-medium max-w-xs">{item.summary}</td>
                      <td className="py-3 px-3 text-slate-600">{item.drafter}</td>
                      <td className="py-3 px-3 text-slate-600">{item.reviewer}</td>
                      <td className="py-3 px-3 text-slate-900 font-semibold">{item.signer}</td>
                      <td className="py-3 px-3 text-slate-600">{item.recipients}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {item.status === 'issued' ? 'Đã ban hành' : 'Đã duyệt'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Add Incoming */}
      {showAddIncomingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Vào sổ văn bản đến mới</h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Số đến:</label>
                  <input
                    type="number"
                    value={newInc.arrivalNumber}
                    onChange={(e) => setNewInc({ ...newInc, arrivalNumber: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded mt-1 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Ngày đến:</label>
                  <input
                    type="text"
                    value={newInc.arrivalDate}
                    onChange={(e) => setNewInc({ ...newInc, arrivalDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Số ký hiệu văn bản:</label>
                  <input
                    type="text"
                    value={newInc.docNumber}
                    onChange={(e) => setNewInc({ ...newInc, docNumber: e.target.value })}
                    placeholder="VD: 5512/BGDĐT-GDTrH"
                    className="w-full p-2 border border-slate-300 rounded mt-1 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Ngày ban hành:</label>
                  <input
                    type="text"
                    value={newInc.issueDate}
                    onChange={(e) => setNewInc({ ...newInc, issueDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Cơ quan ban hành:</label>
                <input
                  type="text"
                  value={newInc.issuingAuthority}
                  onChange={(e) => setNewInc({ ...newInc, issuingAuthority: e.target.value })}
                  placeholder="Phòng GD&ĐT, Sở GD&ĐT..."
                  className="w-full p-2 border border-slate-300 rounded mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Trích yếu nội dung:</label>
                <textarea
                  value={newInc.summary}
                  onChange={(e) => setNewInc({ ...newInc, summary: e.target.value })}
                  placeholder="V/v triển khai công tác giáo dục..."
                  className="w-full p-2 border border-slate-300 rounded mt-1 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Phân công người xử lý:</label>
                  <input
                    type="text"
                    value={newInc.assignedTo}
                    onChange={(e) => setNewInc({ ...newInc, assignedTo: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Thời hạn xử lý:</label>
                  <input
                    type="text"
                    value={newInc.deadline}
                    onChange={(e) => setNewInc({ ...newInc, deadline: e.target.value })}
                    placeholder="25/11/2026"
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowAddIncomingModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveIncoming}
                className="px-4 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded hover:bg-teal-700"
              >
                Lưu vào sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Outgoing */}
      {showAddOutgoingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Vào sổ văn bản đi mới</h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Số văn bản đi:</label>
                  <input
                    type="text"
                    value={newOut.docNumber}
                    onChange={(e) => setNewOut({ ...newOut, docNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded mt-1 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Ngày ban hành:</label>
                  <input
                    type="text"
                    value={newOut.issueDate}
                    onChange={(e) => setNewOut({ ...newOut, issueDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Trích yếu nội dung:</label>
                <textarea
                  value={newOut.summary}
                  onChange={(e) => setNewOut({ ...newOut, summary: e.target.value })}
                  placeholder="V/v báo cáo quyết toán kinh phí..."
                  className="w-full p-2 border border-slate-300 rounded mt-1 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Người soạn:</label>
                  <input
                    type="text"
                    value={newOut.drafter}
                    onChange={(e) => setNewOut({ ...newOut, drafter: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Người duyệt:</label>
                  <input
                    type="text"
                    value={newOut.reviewer}
                    onChange={(e) => setNewOut({ ...newOut, reviewer: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Người ký:</label>
                  <input
                    type="text"
                    value={newOut.signer}
                    onChange={(e) => setNewOut({ ...newOut, signer: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Nơi nhận:</label>
                <input
                  type="text"
                  value={newOut.recipients}
                  onChange={(e) => setNewOut({ ...newOut, recipients: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowAddOutgoingModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveOutgoing}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
              >
                Lưu vào sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
