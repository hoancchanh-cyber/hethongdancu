import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  Key, 
  Plus, 
  Trash2, 
  UserCheck, 
  Activity, 
  Settings, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { UserAccount, SystemLog } from '../types';

interface HeThongViewProps {
  accounts: UserAccount[];
  currentUser: string;
  logs: SystemLog[];
  onAddAccount: (acc: UserAccount) => void;
  onDeleteAccount: (username: string) => void;
  onChangePassword: (username: string, newPass: string) => void;
  onUpdateFullName: (username: string, newName: string) => void;
  onUpdateRole: (username: string, newRole: UserAccount['role']) => void;
}

export default function HeThongView({
  accounts,
  currentUser,
  logs,
  onAddAccount,
  onDeleteAccount,
  onChangePassword,
  onUpdateFullName,
  onUpdateRole
}: HeThongViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'accounts' | 'logs'>('profile');
  
  // Find current active user object
  const activeUserObj = accounts.find(a => a.username === currentUser || a.fullName === currentUser) || {
    username: currentUser,
    fullName: currentUser,
    role: 'Quản trị viên' as const,
    phone: '0988.777.666',
    createdAt: '2026-01-15'
  };

  const isRoleAdmin = (role: string) => 
    role === 'Quản trị viên' || role === 'Cán bộ chính quy' || role === 'Trưởng thôn';

  const isAdmin = isRoleAdmin(activeUserObj.role);

  // Change password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Update profile state
  const [profileName, setProfileName] = useState(activeUserObj.fullName);
  const [profilePhone, setProfilePhone] = useState(activeUserObj.phone || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Add account form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserAccount['role']>('Cộng tác viên');
  const [newPhone, setNewPhone] = useState('');
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Search logs
  const [logSearch, setLogSearch] = useState('');

  // Admin reset other user password state
  const [resettingUser, setResettingUser] = useState<string | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Account list filter by permission groups
  const [groupFilter, setGroupFilter] = useState<'all' | 'admin' | 'user'>('all');

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPass || !newPass || !confirmPass) {
      setPassError('Vui lòng nhập đầy đủ tất cả các trường mật khẩu.');
      return;
    }

    if (activeUserObj.password && currentPass !== activeUserObj.password) {
      setPassError('Mật khẩu hiện tại không chính xác.');
      return;
    }

    if (newPass.length < 4) {
      setPassError('Mật khẩu mới phải từ 4 ký tự trở lên.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    onChangePassword(activeUserObj.username, newPass);
    setPassSuccess('Đổi mật khẩu thành công!');
    setTimeout(() => setPassSuccess(''), 4000);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleProfileUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');

    if (!profileName.trim()) {
      alert('Họ và tên không được để trống.');
      return;
    }

    onUpdateFullName(activeUserObj.username, profileName);
    setProfileSuccess('Cập nhật thông tin cá nhân thành công!');
    setTimeout(() => setProfileSuccess(''), 4000);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newUsername.trim() || !newFullName.trim() || !newPasswordVal) {
      setFormError('Vui lòng điền đầy đủ các trường bắt buộc (*).');
      return;
    }

    const cleanUsername = newUsername.trim().toLowerCase();
    if (accounts.some(a => a.username === cleanUsername)) {
      setFormError('Tên tài khoản này đã tồn tại trên hệ thống.');
      return;
    }

    const newAcc: UserAccount = {
      username: cleanUsername,
      fullName: newFullName.trim(),
      role: newRole,
      phone: newPhone.trim(),
      password: newPasswordVal,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddAccount(newAcc);
    setFormSuccess(`Đã tạo thành công tài khoản cán bộ: ${cleanUsername}`);
    
    // Clear form
    setNewUsername('');
    setNewFullName('');
    setNewPhone('');
    setNewPasswordVal('');
    setTimeout(() => {
      setIsFormOpen(false);
      setFormSuccess('');
    }, 1500);
  };

  const filteredLogs = logs.filter(l => 
    (l.username || '').toLowerCase().includes((logSearch || '').toLowerCase()) ||
    (l.action || '').toLowerCase().includes((logSearch || '').toLowerCase()) ||
    (l.details || '').toLowerCase().includes((logSearch || '').toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Hệ Thống & Phân Quyền</h1>
          <p className="text-slate-500 text-xs mt-1">
            Quản trị viên quản lý danh sách tài khoản cán bộ chính trị, cán bộ địa chính và cán bộ nông nghiệp xã.
          </p>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="flex border-b border-slate-100 pb-3 gap-6">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 px-0.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'profile' 
                ? 'border-emerald-600 text-emerald-800' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Tài Khoản Cá Nhân</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveSubTab('accounts')}
                className={`text-xs font-bold uppercase tracking-wider pb-1 px-0.5 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'accounts' 
                    ? 'border-emerald-600 text-emerald-800' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Quản Lý Cán Bộ ({accounts.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('logs')}
                className={`text-xs font-bold uppercase tracking-wider pb-1 px-0.5 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'logs' 
                    ? 'border-emerald-600 text-emerald-800' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Nhật Ký Hoạt Động ({logs.length})</span>
              </button>
            </>
          )}
        </div>

        {/* --- Profile Subtab --- */}
        {activeSubTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* User Profile Card */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl border border-emerald-200 shadow-inner">
                  {activeUserObj.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">{activeUserObj.fullName}</h3>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold text-[10px] uppercase mt-1">
                    {activeUserObj.role}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-4 space-y-3 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tên đăng nhập hệ thống:</span>
                  <strong className="font-mono text-slate-800">{activeUserObj.username}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số điện thoại liên lạc:</span>
                  <span className="font-mono text-slate-800">{activeUserObj.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày tạo tài khoản:</span>
                  <span className="font-mono text-slate-800">{activeUserObj.createdAt}</span>
                </div>
              </div>

              <form onSubmit={handleProfileUpdateSubmit} className="pt-4 border-t border-slate-200/60 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Cập Nhật Thông Tin Cá Nhân</h4>
                
                {profileSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-500 text-[11px] font-bold uppercase mb-1.5">Họ Và Tên Cán Bộ</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] font-bold uppercase mb-1.5">Số điện thoại liên lạc</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs font-semibold"
                    placeholder="Nhập số điện thoại..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition-all uppercase tracking-wider"
                >
                  Lưu thay đổi hồ sơ
                </button>
              </form>
            </div>

            {/* Right Column: Change Password and Role Privileges */}
            <div className="space-y-6">
              {/* Change Password Panel */}
              <div className="p-6 bg-white border border-slate-200/60 rounded-2xl space-y-4">
                <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>Thiết Lập Mật Khẩu Đăng Nhập Mới</span>
                </h3>

                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 pt-2">
                  {passError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-red-100">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passError}</span>
                    </div>
                  )}
                  {passSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{passSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-500 text-[11px] font-bold uppercase mb-1.5">Mật Khẩu Hiện Tại</label>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[11px] font-bold uppercase mb-1.5">Mật Khẩu Mới</label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      placeholder="Tối thiểu 4 ký tự..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[11px] font-bold uppercase mb-1.5">Nhập Lại Mật Khẩu Mới</label>
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      placeholder="Xác nhận mật khẩu mới..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
                  >
                    Xác nhận đổi mật khẩu
                  </button>
                </form>
              </div>

              {/* Current Role Privileges Box */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Quyền Hạn Vai Trò Của Bạn</span>
                </h3>
                <div className="text-xs space-y-3 font-semibold text-slate-700">
                  <p>Vai trò tài khoản hiện tại: <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold rounded-md">{activeUserObj.role}</span></p>
                  
                  <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-xs space-y-2">
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {activeUserObj.role === 'Quản trị viên' && 'Bạn có toàn quyền truy cập tất cả các chức năng: Quản lý người dùng, phân phối quyền hạn, tra cứu nhật ký hệ thống, quản lý công dân, hộ dân, nông nghiệp, kế hoạch và lập báo cáo.'}
                      {activeUserObj.role === 'Cán bộ chính quy' && 'Bạn có quyền hạn cao cấp: Quản lý dân cư, xây dựng quy hoạch địa phương, kết xuất báo cáo thống kê chính xác và quản lý tài khoản/phân quyền hệ thống.'}
                      {activeUserObj.role === 'Cán bộ nông nghiệp' && 'Quyền hạn của bạn tập trung vào địa chính và nông nghiệp. Bạn được phép cập nhật bản đồ thửa đất, ghi nhận nhật ký canh tác nông thôn và tra cứu sổ tay hướng dẫn cây trồng.'}
                      {activeUserObj.role === 'Cộng tác viên' && 'Bạn có quyền truy cập cơ bản. Bạn có thể tra cứu thông tin dân cư, tham gia cập nhật số liệu khảo sát, và đọc hướng dẫn sổ tay hành chính xã.'}
                      {activeUserObj.role === 'Trưởng thôn' && 'Bạn có quyền hạn Trưởng thôn: Trực tiếp theo dõi tiến độ hoạt động, giám sát quy hoạch nông thôn mới, quản lý dân cư thôn bản và điều phối các công tác hành chính cấp cơ sở.'}
                      {activeUserObj.role === 'Cán bộ Thú y / Thủy lợi' && 'Bạn có quyền hạn Thú y và Thủy lợi: Ghi chép nhật ký nông nghiệp, theo dõi tình hình nguồn nước canh tác và hỗ trợ xử lý dịch tễ gia súc/mùa màng tại địa phương.'}
                      {activeUserObj.role === 'Cán bộ Tư pháp - Hộ tịch' && 'Bạn có quyền hạn Tư pháp - Hộ tịch: Tư vấn pháp luật cơ bản, hỗ trợ khai báo thông tin hộ tịch, quản lý hành chính tư pháp và ghi nhận lịch sử thay đổi thông tin cư trú.'}
                    </p>
                  </div>
                  
                  {!isAdmin && (
                    <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-[11px] font-medium border border-amber-100/60 flex items-start gap-2 leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>Các chức năng quản trị hệ thống nâng cao như Quản lý cán bộ và Nhật ký hệ thống đã được ẩn đi để đảm bảo bảo mật thông tin nội bộ.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Accounts List Subtab --- */}
        {activeSubTab === 'accounts' && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">Danh Bộ Cán Bộ Hệ Thống</h3>
                <p className="text-slate-400 text-[11px]">Danh sách cán bộ được phân cấp quyền truy cập, vận hành cơ sở dữ liệu số hóa xã.</p>
              </div>
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Tài Khoản Mới</span>
              </button>
            </div>

            {/* Permission Matrix mapping */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Bản đồ phân cấp quyền hạn & Vai trò nghiệp vụ xã</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] uppercase">Quản trị viên</span>
                    <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-bold">ADMIN</span>
                  </div>
                  <p className="text-slate-500 font-medium text-[11px] leading-relaxed pt-1">
                    Toàn quyền vận hành hệ thống, phê duyệt tài khoản mới, phân phối quyền hạn (đổi vai trò), và kiểm tra mọi hoạt động qua nhật ký.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] uppercase">Cán bộ chính quy</span>
                    <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-bold">ADMIN</span>
                  </div>
                  <p className="text-slate-500 font-medium text-[11px] leading-relaxed pt-1">
                    Quản lý toàn bộ hồ sơ Công dân, Hộ dân, xây dựng và phê duyệt Kế hoạch phát triển, kết xuất báo cáo thống kê chính trị xã hội.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] uppercase">Trưởng thôn</span>
                    <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-bold">ADMIN</span>
                  </div>
                  <p className="text-slate-500 font-medium text-[11px] leading-relaxed pt-1">
                    Được phân cấp quyền quản trị và quản lý địa bàn thôn trực tiếp. Xem thông tin toàn cục, theo dõi tiến trình thực hiện và kết xuất báo cáo cấp thôn.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase">Cán bộ nông nghiệp</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">USER</span>
                  </div>
                  <p className="text-slate-500 font-medium text-[11px] leading-relaxed pt-1">
                    Chuyên trách Địa chính & Nông nghiệp. Quản lý bản đồ thửa đất, ghi nhận nhật ký canh tác của các hộ gia đình, tra cứu sổ tay cây trồng.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded text-[10px] uppercase">Thú y / Thủy lợi</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">USER</span>
                  </div>
                  <p className="text-slate-500 font-medium text-[11px] leading-relaxed pt-1">
                    Chuyên môn thú y, bảo vệ thực vật, nông lâm kết hợp, vận hành thủy lợi. Ghi chép nhật ký nông thôn, phòng chống dịch tễ mùa màng địa phương.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] uppercase">Tư pháp - Hộ tịch</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">USER</span>
                  </div>
                  <p className="text-slate-500 font-medium text-[11px] leading-relaxed pt-1">
                    Hỗ trợ thủ tục cư trú, tư pháp xã, hành chính thôn. Cập nhật thay đổi, tiếp nhận thông báo cư trú của công dân trên địa bàn.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-[10px] uppercase">Cộng tác viên</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">USER</span>
                  </div>
                  <p className="text-slate-500 font-medium text-[11px] leading-relaxed pt-1">
                    Quyền hạn cơ bản. Khảo sát thực địa, tra cứu thông tin dân cư hành chính, đọc tài liệu hướng dẫn và ghi chép nhật ký cơ bản.
                  </p>
                </div>
              </div>
            </div>

            {/* Create Account Modal Form */}
            {isFormOpen && (
              <form onSubmit={handleCreateAccount} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Đăng ký tài khoản cán bộ mới</h4>
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Đóng
                  </button>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-semibold border border-red-100">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-100">
                    {formSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Họ Tên Cán Bộ *</label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Tên Đăng Nhập (Viết liền không dấu) *</label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs"
                      placeholder="e.g. canbo_nongnghiep"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Mật khẩu ban đầu *</label>
                    <input
                      type="password"
                      required
                      value={newPasswordVal}
                      onChange={(e) => setNewPasswordVal(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs"
                      placeholder="Tối thiểu 4 ký tự..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Số điện thoại liên lạc</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs"
                      placeholder="0912..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Phân Quyền Công Tác *</label>
                    <select
                      value={newRole}
                      onChange={(e: any) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs font-semibold text-slate-700"
                    >
                      <optgroup label="Nhóm Admin (Toàn quyền)">
                        <option value="Quản trị viên">Quản trị viên (Toàn quyền hệ thống & phân phối quyền)</option>
                        <option value="Cán bộ chính quy">Cán bộ chính quy (Quản lý hồ sơ chính, báo cáo & kế hoạch)</option>
                        <option value="Trưởng thôn">Trưởng thôn (Trực tiếp điều hành địa bàn thôn)</option>
                      </optgroup>
                      <optgroup label="Nhóm User (Tác nghiệp)">
                        <option value="Cán bộ nông nghiệp">Cán bộ nông nghiệp (Sử dụng đất đai, nhật ký cây trồng)</option>
                        <option value="Cộng tác viên">Cộng tác viên (Thống kê dân cư và khảo sát thực địa)</option>
                        <option value="Cán bộ Thú y / Thủy lợi">Cán bộ Thú y / Thủy lợi (Bảo vệ mùa màng, dịch bệnh)</option>
                        <option value="Cán bộ Tư pháp - Hộ tịch">Cán bộ Tư pháp - Hộ tịch (Tư pháp, hộ tịch địa phương)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Lưu đăng ký
                  </button>
                </div>
              </form>
            )}

            {/* Group Filter Selector Bar */}
            {(() => {
              const totalCount = accounts.length;
              const adminCount = accounts.filter(a => isRoleAdmin(a.role)).length;
              const userCount = totalCount - adminCount;
              return (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setGroupFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        groupFilter === 'all'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-800'
                      }`}
                    >
                      Tất cả ({totalCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupFilter('admin')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        groupFilter === 'admin'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-800'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Nhóm ADMIN ({adminCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupFilter('user')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        groupFilter === 'user'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-800'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Nhóm USER ({userCount})
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider pr-2 font-mono">
                    Bộ lọc nhóm phân quyền
                  </div>
                </div>
              );
            })()}

            {/* Officers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts
                .filter((acc) => {
                  const isAccAdmin = isRoleAdmin(acc.role);
                  if (groupFilter === 'admin') return isAccAdmin;
                  if (groupFilter === 'user') return !isAccAdmin;
                  return true;
                })
                .map((acc) => {
                  const isAccAdmin = isRoleAdmin(acc.role);
                  const groupName = isAccAdmin ? 'ADMIN' : 'USER';
                  const groupBadgeColor = isAccAdmin 
                    ? 'bg-purple-50 text-purple-700 border-purple-100' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-100';

                  let roleColor = "bg-slate-100 text-slate-800 border-slate-200";
                  if (acc.role === 'Cán bộ chính quy') roleColor = "bg-blue-50 text-blue-800 border-blue-200";
                  if (acc.role === 'Quản trị viên') roleColor = "bg-purple-50 text-purple-800 border-purple-200";
                  if (acc.role === 'Cán bộ nông nghiệp') roleColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                  if (acc.role === 'Trưởng thôn') roleColor = "bg-amber-50 text-amber-800 border-amber-200";
                  if (acc.role === 'Cán bộ Thú y / Thủy lợi') roleColor = "bg-cyan-50 text-cyan-800 border-cyan-200";
                  if (acc.role === 'Cán bộ Tư pháp - Hộ tịch') roleColor = "bg-rose-50 text-rose-800 border-rose-200";

                  const isSelf = acc.username === activeUserObj.username;

                  return (
                    <div key={acc.username} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs hover:border-slate-200 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                              {acc.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1">
                                <span>{acc.fullName}</span>
                                {isSelf && <span className="text-[9px] bg-red-100 text-red-800 px-1 rounded">Bạn</span>}
                              </h4>
                              <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>@{acc.username}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${groupBadgeColor}`}>
                                  NHÓM {groupName}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {isAdmin && !isSelf ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Phân quyền vai trò:</span>
                              <select
                                value={acc.role}
                                onChange={(e) => onUpdateRole(acc.username, e.target.value as any)}
                                className={`px-2 py-1 rounded text-xs font-bold border outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${roleColor}`}
                              >
                                <optgroup label="Nhóm Admin (Toàn quyền)">
                                  <option value="Quản trị viên">Quản trị viên</option>
                                  <option value="Cán bộ chính quy">Cán bộ chính quy</option>
                                  <option value="Trưởng thôn">Trưởng thôn</option>
                                </optgroup>
                                <optgroup label="Nhóm User (Tác nghiệp)">
                                  <option value="Cán bộ nông nghiệp">Cán bộ nông nghiệp</option>
                                  <option value="Cộng tác viên">Cộng tác viên</option>
                                  <option value="Cán bộ Thú y / Thủy lợi">Cán bộ Thú y / Thủy lợi</option>
                                  <option value="Cán bộ Tư pháp - Hộ tịch">Cán bộ Tư pháp - Hộ tịch</option>
                                </optgroup>
                              </select>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Vai trò hiện tại:</span>
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase border w-max ${roleColor}`}>
                                {acc.role}
                              </span>
                            </div>
                          )}
                        </div>

                      <div className="space-y-1 text-[11px] text-slate-500 pt-1 font-semibold">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{acc.phone || "Không có điện thoại"}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ngày tạo: {acc.createdAt}</span>
                        </p>
                      </div>

                      {/* Reset password inline form */}
                      {resettingUser === acc.username && (
                        <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 animate-fadeIn">
                          <label className="block text-slate-600 text-[10px] font-bold uppercase">Mật khẩu mới:</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={resetPasswordVal}
                              onChange={(e) => setResetPasswordVal(e.target.value)}
                              placeholder="Nhập mk mới..."
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (resetPasswordVal.trim().length < 4) {
                                  alert("Mật khẩu phải tối thiểu 4 ký tự!");
                                  return;
                                }
                                onChangePassword(acc.username, resetPasswordVal.trim());
                                setResetSuccessMsg("Đã reset mật khẩu thành công!");
                                setTimeout(() => {
                                  setResettingUser(null);
                                  setResetPasswordVal('');
                                  setResetSuccessMsg('');
                                }, 1500);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-all shadow-xs"
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setResettingUser(null);
                                setResetPasswordVal('');
                                setResetSuccessMsg('');
                              }}
                              className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold hover:bg-slate-300 transition-all"
                            >
                              Hủy
                            </button>
                          </div>
                          {resetSuccessMsg && (
                            <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 p-1 px-1.5 rounded border border-emerald-100 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{resetSuccessMsg}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                      {isAdmin && !isSelf ? (
                        <button
                          type="button"
                          onClick={() => {
                            setResettingUser(acc.username);
                            setResetPasswordVal('123456'); // default reset value for convenience
                            setResetSuccessMsg('');
                          }}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 p-1 rounded hover:bg-emerald-50 transition-all"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Reset mật khẩu</span>
                        </button>
                      ) : (
                        <div />
                      )}

                      <button
                        onClick={() => {
                          if (isSelf) {
                            alert("Bạn không thể xóa chính tài khoản đang đăng nhập của mình!");
                            return;
                          }
                          if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản cán bộ: ${acc.fullName} (@${acc.username})?`)) {
                            onDeleteAccount(acc.username);
                          }
                        }}
                        disabled={isSelf}
                        className={`text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 p-1 rounded hover:bg-red-50 transition-all ${
                          isSelf ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa tài khoản</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- Audit Logs Subtab --- */}
        {activeSubTab === 'logs' && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">Nhật Ký Hành Chính Hệ Thống</h3>
                <p className="text-slate-400 text-[11px]">Tự động ghi lại các hoạt động đăng nhập, đăng xuất, và thay đổi dữ liệu địa chính xã.</p>
              </div>
              <input
                type="text"
                placeholder="Tìm hoạt động, tên cán bộ..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs w-full sm:w-64 font-semibold"
              />
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                      <th className="p-4 w-40">Thời Gian</th>
                      <th className="p-4 w-36">Cán Bộ Vận Hành</th>
                      <th className="p-4 w-48">Hành Động</th>
                      <th className="p-4">Mô Tả Chi Tiết Hoạt Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                          Không tìm thấy bản ghi nhật ký hoạt động phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {log.timestamp}
                            </span>
                          </td>
                          <td className="p-4 text-slate-900">
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[10.5px]">@{log.username}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              log.action.includes('Đăng nhập') ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              log.action.includes('Xóa') ? 'bg-red-50 text-red-700 border border-red-100' :
                              log.action.includes('Thêm') || log.action.includes('Tạo') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 text-[11px] leading-relaxed">
                            {log.details}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
