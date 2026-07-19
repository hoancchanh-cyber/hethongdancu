import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  FileText, 
  User, 
  Calendar, 
  X, 
  AlertCircle,
  Hash,
  ChevronRight,
  Bookmark,
  Info
} from 'lucide-react';
import { HandbookArticle } from '../types';

interface SoTayViewProps {
  articles: HandbookArticle[];
  onAddArticle: (article: HandbookArticle) => void;
  onDeleteArticle: (id: string) => void;
}

export default function SoTayView({
  articles,
  onAddArticle,
  onDeleteArticle
}: SoTayViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticleId, setActiveArticleId] = useState<string>(articles[0]?.id || '');

  // Add Article Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<Partial<HandbookArticle>>({
    title: '',
    category: 'Trồng trọt',
    content: '',
    author: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Trồng trọt',
      content: '',
      author: 'Ban Khuyến nông Xã'
    });
    setFormError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formData.title || !formData.title.trim()) {
      setFormError('Vui lòng nhập tiêu đề bài viết hướng dẫn.');
      return false;
    }
    if (!formData.content || !formData.content.trim()) {
      setFormError('Vui lòng nhập nội dung kỹ thuật chi tiết.');
      return false;
    }
    if (!formData.author || !formData.author.trim()) {
      setFormError('Vui lòng chỉ định tác giả hoặc nguồn tài liệu.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newArticle: HandbookArticle = {
      id: `HB${Date.now().toString().slice(-4)}`,
      title: formData.title!,
      category: formData.category as any,
      content: formData.content!,
      author: formData.author!,
      date: new Date().toISOString().split('T')[0]
    };

    onAddArticle(newArticle);
    setActiveArticleId(newArticle.id); // set newly created article active
    setIsFormOpen(false);
    resetForm();
  };

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = 
      (article.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (article.content || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (article.author || '').toLowerCase().includes((searchTerm || '').toLowerCase());

    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const activeArticle = articles.find(a => a.id === activeArticleId) || filteredArticles[0] || articles[0];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Sổ Tay Hướng Dẫn Kỹ Thuật & Chính Sách</h1>
          <p className="text-slate-500 text-xs mt-1">
            Tra cứu quy trình trồng trọt hữu cơ, chăm sóc gia súc tiêu chuẩn VietGAP và tài liệu các chỉ thị, chính sách hỗ trợ nông nghiệp của nhà nước.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Biên soạn Bài viết Mới</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm từ khóa kỹ thuật bón phân, phòng bệnh tai xanh, nghị định..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
          />
        </div>

        {/* Categories toggler buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['All', 'Trồng trọt', 'Chăn nuôi', 'Chính sách'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'All' ? 'Tất cả chủ đề' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main split view layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Articles List Index (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col max-h-[550px]">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="font-display font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
              Mục Lục Hướng Dẫn ({filteredArticles.length})
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredArticles.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400 italic">
                Không có bài viết hướng dẫn nào phù hợp.
              </p>
            ) : (
              filteredArticles.map((article) => {
                const isActive = article.id === activeArticle?.id;
                
                let catBadge = "bg-green-50 text-green-700";
                if (article.category === "Chăn nuôi") catBadge = "bg-orange-50 text-orange-700";
                if (article.category === "Chính sách") catBadge = "bg-indigo-50 text-indigo-700";

                return (
                  <button
                    key={article.id}
                    onClick={() => setActiveArticleId(article.id)}
                    className={`w-full p-4 text-left transition-all flex justify-between items-start gap-3 border-l-4 ${
                      isActive 
                        ? 'bg-emerald-50/50 border-emerald-600' 
                        : 'border-transparent hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1 w-full overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${catBadge}`}>
                          {article.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{article.date}</span>
                      </div>
                      <h4 className={`text-xs font-bold truncate leading-snug ${isActive ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate font-mono">Tác giả: {article.author}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 self-center ${isActive ? 'text-emerald-700' : 'text-slate-300'}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Article content reader (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 shadow-sm min-h-[450px] flex flex-col justify-between">
          {activeArticle ? (
            <div className="space-y-6">
              {/* Heading meta */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    {activeArticle.category}
                  </span>
                  <span className="text-slate-400 text-xs font-mono">• Đăng ngày {activeArticle.date}</span>
                </div>
                
                <h2 className="font-display font-bold text-lg lg:text-xl text-slate-900 leading-tight">
                  {activeArticle.title}
                </h2>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium font-mono">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Biên soạn: {activeArticle.author}</span>
                  </span>
                  <span>|</span>
                  <span className="text-slate-400">Mã bài viết: {activeArticle.id}</span>
                </div>
              </div>

              {/* Main Text Content rendering with nice whitespace and line-breaks */}
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-4 font-normal">
                {activeArticle.content}
              </div>

              {/* Delete helper at the bottom */}
              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có thực sự muốn xóa bài viết hướng dẫn này?')) {
                      onDeleteArticle(activeArticle.id);
                    }
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100 rounded-lg transition-all"
                >
                  Xóa bài viết này
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
              <BookOpen className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm">Vui lòng lựa chọn một tài liệu ở cột danh sách trái để tiến hành tra cứu nội dung.</p>
            </div>
          )}
        </div>

      </div>

      {/* Editor Add Article Modal Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wide">Biên Soạn Tài Liệu Hướng Dẫn Mới</h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-0.5">Sổ tay nông thôn số</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Title */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Tiêu Đề Bài Hướng Dẫn
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Phương pháp phòng ngừa dịch lở mồm long móng vụ Đông..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Chuyên Mục</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-xs transition-all"
                    >
                      <option value="Trồng trọt">Trồng trọt</option>
                      <option value="Chăn nuôi">Chăn nuôi</option>
                      <option value="Chính sách">Chính sách</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nội Dung Chi Tiết Kỹ Thuật / Điều Khoản</label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Nhập nội dung quy trình chi tiết từng bước..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all font-mono"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tác Giả / Nguồn Trích Dẫn</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Kỹ sư Nguyễn Văn A - Viện Cây Trồng"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/10 transition-all"
                >
                  Lưu & Xuất Bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
