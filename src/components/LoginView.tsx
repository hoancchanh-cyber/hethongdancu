import React, { useState } from 'react';
import { Shield, Key, User, Info, Smartphone, Eye, EyeOff, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { UserAccount } from '../types';

interface LoginViewProps {
  onLogin: (username: string) => void;
  accounts: UserAccount[];
  onRegister: (acc: UserAccount) => void;
  onResetDatabase: () => Promise<void>;
}

export default function LoginView({ onLogin, accounts, onRegister, onResetDatabase }: LoginViewProps) {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sign up fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'Cán bộ chính quy' | 'Cán bộ nông nghiệp' | 'Cộng tác viên'>('Cộng tác viên');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();

    // Search for match in Firebase accounts
    const found = accounts.find((a: UserAccount) => a.username === cleanUser);

    if (found) {
      if (found.password === password) {
        // Login
        onLogin(found.username);
      } else {
        setError('Mật khẩu đăng nhập không chính xác.');
      }
    } else {
      setError('Tài khoản không tồn tại trên hệ thống.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regFullName.trim() || !regUsername.trim() || !regPassword) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc (*).');
      return;
    }

    const cleanRegUser = regUsername.trim().toLowerCase();

    if (accounts.some((a: UserAccount) => a.username === cleanRegUser)) {
      setError('Tên đăng nhập này đã có người sử dụng.');
      return;
    }

    if (regPassword.length < 4) {
      setError('Mật khẩu phải chứa ít nhất 4 ký tự.');
      return;
    }

    const newUser: UserAccount = {
      username: cleanRegUser,
      fullName: regFullName.trim(),
      role: regRole,
      phone: regPhone.trim(),
      password: regPassword,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onRegister(newUser);

    setSuccess('Đăng ký tài khoản cán bộ thành công! Bạn có thể đăng nhập ngay.');
    
    // Autofill login and switch back
    setUsername(cleanRegUser);
    setPassword(regPassword);
    
    setTimeout(() => {
      setIsSigningUp(false);
      setSuccess('');
      // Clear registration form
      setRegFullName('');
      setRegUsername('');
      setRegPassword('');
      setRegPhone('');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -translate-x-20 -translate-y-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 translate-x-20 translate-y-20 animate-pulse"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative z-10"
      >
        {/* Banner header of Government administrative agency */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white text-center relative">
          <div className="mx-auto w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border border-white/20 shadow-inner">
            <Shield className="w-8 h-8 text-yellow-300" />
          </div>
          <h1 className="font-display font-bold text-lg uppercase tracking-wider">Cổng Số Hóa Quốc Gia</h1>
          <p className="text-emerald-100 text-[10px] mt-1 uppercase tracking-widest font-semibold">Cơ sở dữ liệu hành chính Thôn</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500"></div>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold border border-red-100 flex items-start gap-2 mb-4">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-semibold border border-emerald-100 flex items-start gap-2 mb-4 animate-bounce">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {!isSigningUp ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                Đăng nhập hệ thống
              </h2>
              
              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Tên tài khoản</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-semibold transition-all"
                    placeholder="Tài khoản"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Mật khẩu</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-semibold transition-all"
                    placeholder="Mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                Xác Nhận Đăng Nhập
              </button>

              <div className="text-center mt-3 text-xs text-slate-500">
                Chưa có tài khoản cán bộ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setIsSigningUp(true);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                >
                  Đăng ký tài khoản
                </button>
              </div>

              {/* Rescue/Reset database and credentials block */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Không đăng nhập được?</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Bạn có chắc chắn muốn khôi phục lại dữ liệu gốc của toàn hệ thống? Thao tác này sẽ đặt lại tất cả tài khoản cán bộ và dữ liệu dân cư về trạng thái mặc định ban đầu.")) {
                        setError('');
                        setSuccess('');
                        try {
                          await onResetDatabase();
                          setSuccess("Khôi phục toàn bộ cơ sở dữ liệu thành công! Bạn có thể đăng nhập bằng tài khoản mặc định ngay.");
                        } catch (err) {
                          setError("Lỗi khi khôi phục dữ liệu: " + (err instanceof Error ? err.message : String(err)));
                        }
                      }
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer transition-colors"
                  >
                    Khôi phục dữ liệu gốc
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-mono space-y-1">
                  <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider mb-1">Tài khoản mặc định hệ thống:</span>
                  <div>• QTV (Chính): <span className="font-bold text-emerald-700">admin</span> / Mật khẩu: <span className="font-bold text-emerald-700">123456@</span></div>
                  <div>• Cán bộ NN: <span className="font-bold text-slate-600">canbo_nongnghiep</span> / Mật khẩu: <span className="font-bold text-slate-600">123456</span></div>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                Đăng ký tài khoản mới
              </h2>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Họ và tên cán bộ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-semibold transition-all"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Tên tài khoản <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-semibold transition-all"
                    placeholder="Viết liền không dấu, ví dụ: canbo_a"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Mật khẩu đăng nhập <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-semibold transition-all"
                    placeholder="Tối thiểu 4 ký tự"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Số điện thoại liên hệ</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-semibold transition-all"
                    placeholder="Ví dụ: 0912345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Vai trò công vụ</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-semibold transition-all font-sans"
                >
                  <option value="Cộng tác viên">Cộng tác viên</option>
                  <option value="Cán bộ nông nghiệp">Cán bộ nông nghiệp</option>
                  <option value="Cán bộ chính quy">Cán bộ chính quy</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                Đăng Ký Tài Khoản
              </button>

              <div className="text-center mt-3 text-xs text-slate-500">
                Đã có tài khoản cán bộ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setIsSigningUp(false);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </form>
          )}

          {/* Quick instructions block */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center mt-3">
              Mọi hoạt động truy cập và thao tác dữ liệu đều được lưu lại trong nhật ký hệ thống.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
