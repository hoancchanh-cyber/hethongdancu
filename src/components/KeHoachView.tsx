import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  X, 
  AlertCircle,
  TrendingUp,
  User,
  Check,
  Play,
  Info
} from 'lucide-react';
import { LocalPlan } from '../types';

interface KeHoachViewProps {
  plans: LocalPlan[];
  onAddPlan: (plan: LocalPlan) => void;
  onUpdatePlan: (plan: LocalPlan) => void;
  onDeletePlan: (id: string) => void;
  onQuickStatusChange: (id: string, nextStatus: 'Chưa bắt đầu' | 'Đang thực hiện' | 'Đã hoàn thành') => void;
}

export default function KeHoachView({
  plans,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
  onQuickStatusChange
}: KeHoachViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<Partial<LocalPlan>>({
    id: '',
    title: '',
    objective: '',
    startDate: '',
    endDate: '',
    assignee: '',
    status: 'Chưa bắt đầu'
  });

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      objective: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      assignee: '',
      status: 'Chưa bắt đầu'
    });
    setFormError('');
  };

  const handleOpenAdd = () => {
    setFormMode('add');
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (plan: LocalPlan) => {
    setFormMode('edit');
    setFormData(plan);
    setFormError('');
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formData.title || !formData.title.trim()) {
      setFormError('Vui lòng điền tiêu đề kế hoạch/nhiệm vụ.');
      return false;
    }
    if (!formData.objective || !formData.objective.trim()) {
      setFormError('Vui lòng ghi rõ mục tiêu thực hiện.');
      return false;
    }
    if (!formData.startDate) {
      setFormError('Vui lòng chọn ngày bắt đầu.');
      return false;
    }
    if (!formData.endDate) {
      setFormError('Vui lòng chọn hạn chót/ngày kết thúc.');
      return false;
    }
    if (!formData.assignee || !formData.assignee.trim()) {
      setFormError('Vui lòng chỉ định cá nhân hoặc ban ngành phụ trách.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const planToSave = {
      ...formData,
      id: formData.id || `PLAN${Date.now().toString().slice(-4)}`
    } as LocalPlan;

    if (formMode === 'add') {
      onAddPlan(planToSave);
    } else {
      onUpdatePlan(planToSave);
    }
    setIsFormOpen(false);
    resetForm();
  };

  // Filter plans list
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = 
      (plan.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (plan.objective || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (plan.assignee || '').toLowerCase().includes((searchTerm || '').toLowerCase());

    const matchesStatus = selectedStatus === 'All' || plan.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Count helper
  const total = plans.length;
  const inProgress = plans.filter(p => p.status === 'Đang thực hiện').length;
  const completed = plans.filter(p => p.status === 'Đã hoàn thành').length;
  const pending = plans.filter(p => p.status === 'Chưa bắt đầu').length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Kế Hoạch Địa Phương</h1>
          <p className="text-slate-500 text-xs mt-1">
            Lên kế hoạch sản xuất, công tác tiêm phòng dịch hại, sửa sang thủy lợi và nâng cấp hạ tầng chuẩn nông thôn mới toàn xã.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Kế Hoạch / Nhiệm Vụ</span>
        </button>
      </div>

      {/* Numerical Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Tổng số kế hoạch</p>
          <p className="text-xl font-bold text-slate-800 font-display mt-0.5">{total}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">Chưa bắt đầu</p>
          <p className="text-xl font-bold text-slate-700 font-display mt-0.5">{pending}</p>
        </div>
        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wide">Đang thực hiện</p>
          <p className="text-xl font-bold text-amber-800 font-display mt-0.5">{inProgress}</p>
        </div>
        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wide">Đã hoàn thành</p>
          <p className="text-xl font-bold text-emerald-800 font-display mt-0.5">{completed}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm kế hoạch, nội dung chỉ đạo, người phụ trách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full md:w-52">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-xs transition-all"
          >
            <option value="All">Trạng thái: Tất cả</option>
            <option value="Chưa bắt đầu">Chưa bắt đầu</option>
            <option value="Đang thực hiện">Đang thực hiện</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Plans List Cards */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="bg-white p-8 text-center text-slate-400 rounded-2xl border border-slate-100">
            Chưa tìm thấy kế hoạch/nhiệm vụ nào được tạo.
          </div>
        ) : (
          filteredPlans.map((plan) => {
            let statusBadge = "bg-slate-100 text-slate-700 border-slate-200";
            let statusIcon = <Clock className="w-4 h-4 text-slate-500" />;
            
            if (plan.status === 'Đang thực hiện') {
              statusBadge = "bg-amber-50 text-amber-700 border-amber-100";
              statusIcon = <Clock className="w-4 h-4 text-amber-600 animate-spin-slow" />;
            } else if (plan.status === 'Đã hoàn thành') {
              statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
              statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
            }

            return (
              <div 
                key={plan.id} 
                className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-start md:justify-between gap-6"
              >
                {/* Info Part */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="bg-slate-100 text-slate-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                      ID: {plan.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1.5 ${statusBadge}`}>
                      {statusIcon}
                      <span>{plan.status}</span>
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-slate-900">{plan.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong>Mục tiêu:</strong> {plan.objective}
                  </p>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phụ trách: <strong className="text-slate-700">{plan.assignee}</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{plan.startDate} đến {plan.endDate}</span>
                    </span>
                  </div>
                </div>

                {/* Operations Part */}
                <div className="flex md:flex-col gap-2 shrink-0 justify-end items-center md:items-stretch">
                  {/* Quick state change triggers */}
                  {plan.status === 'Chưa bắt đầu' && (
                    <button
                      onClick={() => onQuickStatusChange(plan.id, 'Đang thực hiện')}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <Play className="w-3 h-3 text-amber-700" />
                      <span>Bắt đầu chạy</span>
                    </button>
                  )}
                  {plan.status === 'Đang thực hiện' && (
                    <button
                      onClick={() => onQuickStatusChange(plan.id, 'Đã hoàn thành')}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>Báo hoàn thành</span>
                    </button>
                  )}

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg transition-all"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Xác nhận xóa hoàn toàn kế hoạch này khỏi hệ thống?')) {
                          onDeletePlan(plan.id);
                        }
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-600 rounded-lg transition-all"
                      title="Xóa kế hoạch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Plan Form Modal dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wide">
                  {formMode === 'add' ? 'Lập Kế Hoạch Công Tác Mới' : 'Cập Nhật Kế Hoạch Chỉ Đạo'}
                </h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-0.5">Sổ quyết định xã</p>
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
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Tiêu Đề Kế Hoạch / Tên Nhiệm Vụ
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Chiến dịch phòng chống dịch cúm gia cầm đợt 2..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* Objective */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mục Tiêu Thực Hiện Chi Tiết</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ghi rõ các chỉ tiêu chất lượng cần đạt, phân phối, diện tích, hay tỷ lệ tiêm phòng..."
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ngày Bắt Đầu</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ngày Kết Thúc (Dự kiến)</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                    />
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Người / Bộ Phận Phụ Trách</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Trạm thú y xã, Thôn trưởng..."
                      value={formData.assignee}
                      onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Trạng Thái Hiện Tại</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-xs transition-all"
                    >
                      <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                      <option value="Đang thực hiện">Đang thực hiện</option>
                      <option value="Đã hoàn thành">Đã hoàn thành</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/10 transition-all"
                >
                  Lưu Kế Hoạch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
