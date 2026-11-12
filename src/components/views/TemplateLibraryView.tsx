import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Download,
  Copy,
  FileText,
  ExternalLink,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { FormTemplate, SchoolProfile } from '../../types';
import { PRESET_TEMPLATES, TEMPLATE_CATEGORIES } from '../../data/presetTemplates';
import { generateAdminDocx, downloadFile } from '../../utils/docxGenerator';

interface TemplateLibraryViewProps {
  schoolProfile: SchoolProfile;
  onSelectToFill: (tpl: FormTemplate) => void;
}

export const TemplateLibraryView: React.FC<TemplateLibraryViewProps> = ({
  schoolProfile,
  onSelectToFill,
}) => {
  const [templates, setTemplates] = useState<FormTemplate[]>(PRESET_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(null);

  const filteredTemplates = templates.filter((tpl) => {
    const matchCat = selectedCategory === 'Tất cả' || tpl.category === selectedCategory;
    const matchSearch =
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleDownloadDocx = async (tpl: FormTemplate) => {
    const doc = {
      id: tpl.id,
      title: tpl.title,
      category: 'bieu_mau_khac' as const,
      docNumber: '…/BM',
      issueDate: new Date().toLocaleDateString('vi-VN'),
      location: 'TP. Hồ Chí Minh',
      subject: tpl.title,
      signerName: schoolProfile.principalName,
      signerPosition: 'HIỆU TRƯỞNG',
      recipients: ['Lưu: VT'],
      content: tpl.templateContent,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: schoolProfile.principalName,
    };

    try {
      const blob = await generateAdminDocx(doc, schoolProfile);
      downloadFile(blob, `${tpl.id}_mau.docx`);
    } catch (err: any) {
      alert('Lỗi tải file mẫu: ' + err.message);
    }
  };

  const handleDuplicate = (tpl: FormTemplate) => {
    const copy: FormTemplate = {
      ...tpl,
      id: `${tpl.id}_copy_${Date.now()}`,
      title: `${tpl.title} (Bản sao)`,
      isBuiltIn: false,
    };
    setTemplates([copy, ...templates]);
    alert(`Đã nhân bản biểu mẫu "${tpl.title}" thành công!`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Thư viện 12 nhóm biểu mẫu trường học</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Kho biểu mẫu nhà trường chuẩn quy chuẩn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp đầy đủ các mẫu quyết định, kế hoạch, giấy mời, tờ trình, biểu mẫu chuyên môn, đoàn thể, y tế, thiết bị theo quy định của Bộ Giáo dục và Đào tạo.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên biểu mẫu, từ khóa, nhãn..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-blue-500"
          />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium text-slate-800"
          >
            <option value="Tất cả">Tất cả 12 danh mục</option>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {tpl.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                  {tpl.fileType}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                {tpl.title}
              </h3>

              <p className="text-xs text-slate-500 line-clamp-3">
                {tpl.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {tpl.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownloadDocx(tpl)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded"
                  title="Tải mẫu Word"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDuplicate(tpl)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded"
                  title="Nhân bản mẫu"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => onSelectToFill(tpl)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                <span>Dùng mẫu này</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
