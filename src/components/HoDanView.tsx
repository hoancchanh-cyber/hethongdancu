import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Home, 
  Phone, 
  MapPin, 
  AlertCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import { Household, Citizen } from '../types';

interface HoDanViewProps {
  households: Household[];
  citizens: Citizen[];
  onAddHousehold: (household: Household) => void;
  onUpdateHousehold: (household: Household) => void;
  onDeleteHousehold: (id: string) => void;
}

export default function HoDanView({
  households,
  citizens,
  onAddHousehold,
  onUpdateHousehold,
  onDeleteHousehold
}: HoDanViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [expandedHouseholdId, setExpandedHouseholdId] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<Partial<Household>>({
    id: '',
    householderName: '',
    address: '',
    memberCount: 1,
    phone: '',
    status: 'Thường',
    landArea: 0
  });

  const resetForm = () => {
    setFormData({
      id: '',
      householderName: '',
      address: '',
      memberCount: 1,
      phone: '',
      status: 'Thường',
      landArea: 0
    });
    setFormError('');
  };

  const handleOpenAdd = () => {
    setFormMode('add');
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (household: Household) => {
    setFormMode('edit');
    setFormData(household);
    setFormError('');
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formData.id || !formData.id.trim()) {
      setFormError('Mã hộ khẩu không được để trống.');
      return false;
    }
    if (!formData.householderName || formData.householderName.trim().length < 2) {
      setFormError('Tên chủ hộ không hợp lệ.');
      return false;
    }
    if (!formData.address || !formData.address.trim()) {
      setFormError('Vui lòng nhập địa chỉ thôn xóm.');
      return false;
    }
    if (formData.memberCount === undefined || formData.memberCount < 1) {
      setFormError('Số thành viên phải từ 1 người trở lên.');
      return false;
    }
    if (formMode === 'add' && households.some(h => h.id === formData.id)) {
      setFormError('Mã hộ khẩu này đã tồn tại trong hệ thống.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const householdToSave = formData as Household;
    if (formMode === 'add') {
      onAddHousehold(householdToSave);
    } else {
      onUpdateHousehold(householdToSave);
    }
    setIsFormOpen(false);
    resetForm();
  };

  const toggleExpand = (id: string) => {
    setExpandedHouseholdId(expandedHouseholdId === id ? null : id);
  };

  // Filter households
  const filteredHouseholds = households.filter((h) => {
    const matchesSearch = 
      (h.id || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (h.householderName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (h.address || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (h.phone || '').includes(searchTerm || '');

    const matchesStatus = selectedStatus === 'All' || h.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const total = households.length;
  const poorCount = households.filter(h => h.status === 'Nghèo').length;
  const nearPoorCount = households.filter(h => h.status === 'Cận nghèo').length;
  const standardCount = households.filter(h => h.status === 'Thường').length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Quản Lý Hộ Dân</h1>
          <p className="text-slate-500 text-xs mt-1">
            Quản lý thông tin hộ gia đình, phân loại hộ nghèo/cận nghèo, đăng ký địa chỉ cư trú và theo dõi diện tích đất sản xuất.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Hộ Khẩu Mới</span>
        </button>
      </div>

      {/* Household Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Tổng số hộ</p>
          <p className="text-xl font-bold text-slate-800 font-display mt-0.5">{total}</p>
        </div>
        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wide">Hộ thường</p>
          <p className="text-xl font-bold text-emerald-800 font-display mt-0.5">{standardCount}</p>
        </div>
        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wide">Hộ cận nghèo</p>
          <p className="text-xl font-bold text-amber-800 font-display mt-0.5">{nearPoorCount}</p>
        </div>
        <div className="bg-red-50/40 p-4 rounded-xl border border-red-100 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-red-700 tracking-wide">Hộ nghèo</p>
          <p className="text-xl font-bold text-red-800 font-display mt-0.5">{poorCount}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo Mã hộ, Tên chủ hộ, Địa chỉ, Số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white rounded-xl text-xs transition-all"
          />
        </div>

        {/* Status select */}
        <div className="w-full md:w-52">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-xs transition-all"
          >
            <option value="All">Phân loại: Tất cả</option>
            <option value="Thường">Hộ Thường</option>
            <option value="Cận nghèo">Hộ Cận Nghèo</option>
            <option value="Nghèo">Hộ Nghèo</option>
          </select>
        </div>
      </div>

      {/* Households Table list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-4 px-6 w-10"></th>
                <th className="py-4 px-6">Mã Hộ Khẩu</th>
                <th className="py-4 px-6">Họ Tên Chủ Hộ</th>
                <th className="py-4 px-6">Địa Chỉ Đăng Ký</th>
                <th className="py-4 px-6 text-center">Thành Viên</th>
                <th className="py-4 px-6">Số Điện Thoại</th>
                <th className="py-4 px-6">Phân Loại Hộ</th>
                <th className="py-4 px-6 text-right">Đất Canh Tác</th>
                <th className="py-4 px-6 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredHouseholds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không tìm thấy dữ liệu hộ dân phù hợp.
                  </td>
                </tr>
              ) : (
                filteredHouseholds.map((household) => {
                  const isExpanded = expandedHouseholdId === household.id;
                  const householdMembers = citizens.filter(c => c.householdId === household.id);
                  
                  let statusTagClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  if (household.status === 'Cận nghèo') statusTagClass = "bg-amber-50 text-amber-700 border-amber-100";
                  if (household.status === 'Nghèo') statusTagClass = "bg-red-50 text-red-700 border-red-100";

                  return (
                    <React.Fragment key={household.id}>
                      <tr 
                        className={`hover:bg-slate-50/80 transition-all ${isExpanded ? 'bg-slate-50/50' : ''}`}
                      >
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={() => toggleExpand(household.id)}
                            className="p-1 rounded-full hover:bg-slate-200 transition-all text-slate-500"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">{household.id}</td>
                        <td className="py-4 px-6 font-semibold text-slate-900">{household.householderName}</td>
                        <td className="py-4 px-6 text-slate-600">{household.address}</td>
                        <td className="py-4 px-6 text-center font-semibold font-mono">
                          {householdMembers.length > 0 ? householdMembers.length : household.memberCount} người
                        </td>
                        <td className="py-4 px-6 font-mono">{household.phone}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusTagClass}`}>
                            {household.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-semibold">{household.landArea.toLocaleString()} m²</td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(household)}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-700 transition-all"
                              title="Sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Xác nhận xóa Hộ khẩu: ${household.id} (${household.householderName})?`)) {
                                  onDeleteHousehold(household.id);
                                }
                              }}
                              className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600 transition-all"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable family members block */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="bg-slate-50/50 p-6 border-l-4 border-indigo-500">
                            <div className="space-y-3">
                              <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600" />
                                Thành viên thuộc Hộ Khẩu {household.id}
                              </h4>
                              
                              {householdMembers.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">
                                  Hộ này hiện chưa gán thành viên công dân nào. Vui lòng cập nhật hồ sơ Công Dân để liên kết vào hộ khẩu này.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {householdMembers.map((member) => (
                                    <div 
                                      key={member.id} 
                                      className="p-3 bg-white rounded-xl border border-slate-100 flex items-start justify-between gap-3 shadow-xs"
                                    >
                                      <div>
                                        <p className="font-semibold text-slate-900 text-xs">{member.fullName}</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Sinh: {member.dob} | {member.gender}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Nghề nghiệp: {member.occupation || 'Không'}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">CCCD: {member.id}</p>
                                      </div>
                                      {member.isHouseholder ? (
                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                                          Chủ Hộ
                                        </span>
                                      ) : (
                                        <span className="bg-slate-100 text-slate-600 text-[9px] font-medium px-2 py-0.5 rounded-full shrink-0">
                                          Thành viên
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Household Creation / Update modal form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wide">
                  {formMode === 'add' ? 'Khai báo Sổ Hộ Khẩu Mới' : 'Cập Nhật Thông Tin Hộ Gia Đình'}
                </h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-0.5">Sổ bộ xã</p>
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

              <div className="grid grid-cols-2 gap-4">
                {/* ID (Household Code) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Mã Hộ Khẩu (Ví dụ: HK006)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={formMode === 'edit'}
                    placeholder="Nhập mã hộ khẩu..."
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white rounded-xl text-xs transition-all disabled:opacity-50"
                  />
                </div>

                {/* Householder name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Họ Tên Chủ Hộ</label>
                  <input
                    type="text"
                    required
                    placeholder="Tên người làm chủ hộ..."
                    value={formData.householderName}
                    onChange={(e) => setFormData({ ...formData, householderName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Địa Chỉ Chi Tiết (Thôn, Xóm)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Xóm 2, Thôn Hòa Bình"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* Family Members count */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Số Thành Viên Dự Kiến</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.memberCount}
                    onChange={(e) => setFormData({ ...formData, memberCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    placeholder="Số liên hệ chủ hộ..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* Poor or not Status */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phân Loại Hộ Gia Đình</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-xs transition-all"
                  >
                    <option value="Thường">Thường</option>
                    <option value="Cận nghèo">Cận nghèo</option>
                    <option value="Nghèo">Nghèo</option>
                  </select>
                </div>

                {/* Agricultural Land Area */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tổng Diện Tích Đất Sản Xuất (m²)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.landArea}
                    onChange={(e) => setFormData({ ...formData, landArea: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/10 transition-all"
                >
                  Lưu Sổ Hộ Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
