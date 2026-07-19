import React from 'react';
import { 
  Home, 
  Users, 
  Building2, 
  Sprout, 
  ClipboardCheck, 
  BookOpen, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  user: string;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ 
  currentTab, 
  onTabChange, 
  user, 
  onLogout, 
  isOpen, 
  setIsOpen 
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Bảng Điều Khiển', icon: Home },
    { id: 'congdan', label: 'Quản Lý Công Dân', icon: Users },
    { id: 'hodan', label: 'Quản Lý Hộ Dân', icon: Building2 },
    { id: 'nongnghiep', label: 'Quản Lý Nông Nghiệp', icon: Sprout },
    { id: 'kehoach', label: 'Kế Hoạch Địa Phương', icon: ClipboardCheck },
    { id: 'sotay', label: 'Sổ Tay Hướng Dẫn', icon: BookOpen },
    { id: 'baocao', label: 'Báo Cáo & Thống Kê', icon: BarChart3 },
    { id: 'hethong', label: 'Tài Khoản & Hệ Thống', icon: Shield },
  ];

  return (
    <>
      {/* Sidebar background overlay on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Upper Sidebar: Branding & Navigation */}
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="p-6 bg-slate-950 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 shadow-md ring-2 ring-amber-500/20">
              <span className="text-xl font-bold font-display">★</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-slate-100 tracking-wide uppercase">Cổng Số Hóa Thôn</h2>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mt-0.5">Quản Lý Hành Chính</p>
            </div>
          </div>

          {/* Logged in User Profile Info */}
          <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Tài khoản</p>
              <p className="text-xs font-semibold text-slate-200 truncate">{user}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 rounded-xl flex items-center gap-3.5 text-sm font-medium transition-all duration-250
                    ${isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10 font-semibold' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}
                  `}
                >
                  <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower Sidebar: App Info & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
          <button
            onClick={onLogout}
            className="w-full px-4 py-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/50 text-red-400 rounded-xl flex items-center gap-3.5 text-sm font-medium transition-all duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0 text-red-400" />
            <span>Đăng xuất</span>
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-600 font-mono">Phiên bản Số hóa 1.2.0</p>
            <p className="text-[9px] text-slate-700 font-mono mt-0.5">© 2026 Xây dựng Nông thôn mới</p>
          </div>
        </div>
      </aside>
    </>
  );
}
