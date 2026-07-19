import React, { useState, useEffect } from 'react';
import { Citizen, Household, LandPlot, FarmingLog, LocalPlan, HandbookArticle, UserAccount, SystemLog } from './types';
import { 
  seedDatabase, 
  subscribeCollection, 
  saveDocument, 
  deleteDocument, 
  COLLECTIONS,
  forceResetDatabase
} from './lib/firebaseService';
import { INITIAL_ACCOUNTS } from './data/mockData';

// Components
import { LogOut, Menu, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CongDanView from './components/CongDanView';
import HoDanView from './components/HoDanView';
import NongNghiepView from './components/NongNghiepView';
import KeHoachView from './components/KeHoachView';
import SoTayView from './components/SoTayView';
import BaoCaoView from './components/BaoCaoView';
import HeThongView from './components/HeThongView';

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto clear toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Core Entity States
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [plots, setPlots] = useState<LandPlot[]>([]);
  const [logs, setLogs] = useState<FarmingLog[]>([]);
  const [plans, setPlans] = useState<LocalPlan[]>([]);
  const [articles, setArticles] = useState<HandbookArticle[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  // Modal bridge flags to allow cross-component addition triggers
  const [isFarmingLogModalOpen, setIsFarmingLogModalOpen] = useState(false);

  // Initialize and load from Firebase
  useEffect(() => {
    // Check local session
    const storedUser = localStorage.getItem('sh_user');
    if (storedUser) setUser(storedUser);

    let unsubscribes: (() => void)[] = [];

    const initializeAndSubscribe = async () => {
      // First make sure the database has initial data if empty
      await seedDatabase();

      // Subscribe to all collections
      const unsubCitizens = subscribeCollection<Citizen>(COLLECTIONS.CITIZENS, (data) => {
        setCitizens(data);
      });
      const unsubHouseholds = subscribeCollection<Household>(COLLECTIONS.HOUSEHOLDS, (data) => {
        setHouseholds(data);
      });
      const unsubPlots = subscribeCollection<LandPlot>(COLLECTIONS.PLOTS, (data) => {
        setPlots(data);
      });
      const unsubLogs = subscribeCollection<FarmingLog>(COLLECTIONS.FARMING_LOGS, (data) => {
        setLogs(data);
      });
      const unsubPlans = subscribeCollection<LocalPlan>(COLLECTIONS.PLANS, (data) => {
        setPlans(data);
      });
      const unsubArticles = subscribeCollection<HandbookArticle>(COLLECTIONS.ARTICLES, (data) => {
        setArticles(data);
      });
      const unsubAccounts = subscribeCollection<UserAccount>(COLLECTIONS.ACCOUNTS, (data) => {
        setAccounts(data);
      });
      // Sort system logs by timestamp descending so the newest are on top
      const unsubSysLogs = subscribeCollection<SystemLog>(COLLECTIONS.SYSTEM_LOGS, (data) => {
        const filtered = data.filter(log => log.id !== 'SEED_STATUS');
        setSystemLogs(filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      });

      unsubscribes = [
        unsubCitizens, 
        unsubHouseholds, 
        unsubPlots, 
        unsubLogs, 
        unsubPlans, 
        unsubArticles, 
        unsubAccounts, 
        unsubSysLogs
      ];
    };

    initializeAndSubscribe();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Auth actions
  const addSystemLog = (action: string, details: string, activeUser: string = user || 'Hệ thống') => {
    const newLogId = `LOG_${Date.now()}`;
    const newLog: SystemLog = {
      id: newLogId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      username: activeUser,
      action,
      details
    };
    saveDocument(COLLECTIONS.SYSTEM_LOGS, newLogId, newLog);
  };

  const handleAddAccount = (acc: UserAccount) => {
    saveDocument(COLLECTIONS.ACCOUNTS, acc.username, acc);
    addSystemLog("Thêm cán bộ", `Đăng ký thành công tài khoản cán bộ mới: ${acc.fullName} (@${acc.username})`);
  };

  const handleDeleteAccount = (username: string) => {
    const target = accounts.find(a => a.username === username);
    deleteDocument(COLLECTIONS.ACCOUNTS, username);
    if (target) {
      addSystemLog("Xóa tài khoản", `Đã xóa tài khoản của cán bộ: ${target.fullName} (@${username})`);
    }
  };

  const handleChangePassword = (username: string, newPass: string) => {
    const target = accounts.find(a => a.username === username);
    if (target) {
      saveDocument(COLLECTIONS.ACCOUNTS, username, { ...target, password: newPass });
      if (username === user) {
        addSystemLog("Đổi mật khẩu", `Cán bộ tự thay đổi mật khẩu đăng nhập cá nhân.`, username);
        setToast({ message: "Đã đổi mật khẩu cá nhân thành công!", type: "success" });
      } else {
        addSystemLog("Khôi phục mật khẩu", `Quản trị viên/Cán bộ cấp cao đã khôi phục (reset) mật khẩu cho cán bộ ${target.fullName} (@${username}).`, user || 'Hệ thống');
        setToast({ message: `Đã reset mật khẩu của cán bộ ${target.fullName} thành công!`, type: "success" });
      }
    }
  };

  const handleUpdateFullName = (username: string, newName: string) => {
    const target = accounts.find(a => a.username === username);
    if (target) {
      saveDocument(COLLECTIONS.ACCOUNTS, username, { ...target, fullName: newName });
      addSystemLog("Cập nhật hồ sơ", `Cập nhật thông tin hiển thị cán bộ thành "${newName}".`, username);
    }
  };

  const handleUpdateRole = (username: string, newRole: UserAccount['role']) => {
    const target = accounts.find(a => a.username === username);
    if (target) {
      const oldRole = target.role;
      saveDocument(COLLECTIONS.ACCOUNTS, username, { ...target, role: newRole });
      addSystemLog("Phân quyền", `Đã thay đổi vai trò của cán bộ ${target.fullName} (@${username}) từ "${oldRole}" thành "${newRole}".`, user || 'Hệ thống');
    }
  };

  const handleLogin = (username: string) => {
    localStorage.setItem('sh_user', username);
    setUser(username);
    const target = accounts.find(a => a.username === username);
    if (target) {
      addSystemLog("Đăng nhập", `Cán bộ ${target.fullName} (${target.role}) đăng nhập thành công vào hệ thống.`, username);
    }
  };

  const handleLogout = () => {
    if (user) {
      addSystemLog("Đăng xuất", `Cán bộ đăng xuất khỏi phiên làm việc hệ thống.`, user);
    }
    localStorage.removeItem('sh_user');
    setUser(null);
  };

  // --- Citizen CRUD functions ---
  const handleAddCitizen = (newC: Citizen) => {
    saveDocument(COLLECTIONS.CITIZENS, newC.id, newC);
  };

  const handleUpdateCitizen = (updatedC: Citizen) => {
    saveDocument(COLLECTIONS.CITIZENS, updatedC.id, updatedC);
  };

  const handleImportCitizens = async (imported: Citizen[]) => {
    for (const c of imported) {
      await saveDocument(COLLECTIONS.CITIZENS, c.id, c);
    }
    addSystemLog(
      "Nhập Excel",
      `Nhập thành công ${imported.length} hồ sơ công dân từ tệp Excel vào cơ sở dữ liệu.`
    );
  };

  const handleDeleteCitizen = (id: string) => {
    deleteDocument(COLLECTIONS.CITIZENS, id);
  };

  // --- Household CRUD functions ---
  const handleAddHousehold = (newH: Household) => {
    saveDocument(COLLECTIONS.HOUSEHOLDS, newH.id, newH);
  };

  const handleUpdateHousehold = (updatedH: Household) => {
    saveDocument(COLLECTIONS.HOUSEHOLDS, updatedH.id, updatedH);
  };

  const handleDeleteHousehold = (id: string) => {
    deleteDocument(COLLECTIONS.HOUSEHOLDS, id);
  };

  // --- Land Plot CRUD functions ---
  const handleAddPlot = (newP: LandPlot) => {
    saveDocument(COLLECTIONS.PLOTS, newP.id, newP);
  };

  const handleUpdatePlot = (updatedP: LandPlot) => {
    saveDocument(COLLECTIONS.PLOTS, updatedP.id, updatedP);
  };

  const handleDeletePlot = (id: string) => {
    deleteDocument(COLLECTIONS.PLOTS, id);
  };

  // --- Farming Log CRUD functions ---
  const handleAddFarmingLog = (newL: FarmingLog) => {
    saveDocument(COLLECTIONS.FARMING_LOGS, newL.id, newL);
  };

  const handleDeleteFarmingLog = (id: string) => {
    deleteDocument(COLLECTIONS.FARMING_LOGS, id);
  };

  // --- Plan CRUD functions ---
  const handleAddPlan = (newP: LocalPlan) => {
    saveDocument(COLLECTIONS.PLANS, newP.id, newP);
  };

  const handleUpdatePlan = (updatedP: LocalPlan) => {
    saveDocument(COLLECTIONS.PLANS, updatedP.id, updatedP);
  };

  const handleDeletePlan = (id: string) => {
    deleteDocument(COLLECTIONS.PLANS, id);
  };

  const handleQuickStatusChange = (id: string, nextStatus: 'Chưa bắt đầu' | 'Đang thực hiện' | 'Đã hoàn thành') => {
    const target = plans.find(p => p.id === id);
    if (target) {
      saveDocument(COLLECTIONS.PLANS, id, { ...target, status: nextStatus });
    }
  };

  // --- Article CRUD functions ---
  const handleAddArticle = (newA: HandbookArticle) => {
    saveDocument(COLLECTIONS.ARTICLES, newA.id, newA);
  };

  const handleDeleteArticle = (id: string) => {
    deleteDocument(COLLECTIONS.ARTICLES, id);
  };

  // Switch views and bridge interactions
  const triggerAddFarmingLog = () => {
    setCurrentTab('nongnghiep');
    setIsFarmingLogModalOpen(true);
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            citizens={citizens}
            households={households}
            plots={plots}
            plans={plans}
            logs={logs}
            onTabChange={setCurrentTab}
            onAddCitizen={() => setCurrentTab('congdan')}
            onAddHousehold={() => setCurrentTab('hodan')}
            onAddFarmingLog={triggerAddFarmingLog}
          />
        );
      case 'congdan':
        return (
          <CongDanView
            citizens={citizens}
            households={households}
            onAddCitizen={handleAddCitizen}
            onUpdateCitizen={handleUpdateCitizen}
            onDeleteCitizen={handleDeleteCitizen}
            onImportCitizens={handleImportCitizens}
          />
        );
      case 'hodan':
        return (
          <HoDanView
            households={households}
            citizens={citizens}
            onAddHousehold={handleAddHousehold}
            onUpdateHousehold={handleUpdateHousehold}
            onDeleteHousehold={handleDeleteHousehold}
          />
        );
      case 'nongnghiep':
        return (
          <NongNghiepView
            plots={plots}
            logs={logs}
            households={households}
            onAddPlot={handleAddPlot}
            onUpdatePlot={handleUpdatePlot}
            onDeletePlot={handleDeletePlot}
            onAddFarmingLog={handleAddFarmingLog}
            onDeleteFarmingLog={handleDeleteFarmingLog}
            isFarmingLogModalOpen={isFarmingLogModalOpen}
            setIsFarmingLogModalOpen={setIsFarmingLogModalOpen}
          />
        );
      case 'kehoach':
        return (
          <KeHoachView
            plans={plans}
            onAddPlan={handleAddPlan}
            onUpdatePlan={handleUpdatePlan}
            onDeletePlan={handleDeletePlan}
            onQuickStatusChange={handleQuickStatusChange}
          />
        );
      case 'sotay':
        return (
          <SoTayView
            articles={articles}
            onAddArticle={handleAddArticle}
            onDeleteArticle={handleDeleteArticle}
          />
        );
      case 'baocao':
        return (
          <BaoCaoView
            citizens={citizens}
            households={households}
            plots={plots}
            plans={plans}
          />
        );
      case 'hethong':
        return (
          <HeThongView
            accounts={accounts}
            currentUser={user}
            logs={systemLogs}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
            onChangePassword={handleChangePassword}
            onUpdateFullName={handleUpdateFullName}
            onUpdateRole={handleUpdateRole}
          />
        );
      default:
        return <div>Chọn phân mục điều hành...</div>;
    }
  };

  // If user is not logged in, show Login view
  if (!user) {
    return (
      <LoginView 
        onLogin={handleLogin} 
        accounts={accounts} 
        onRegister={handleAddAccount} 
        onResetDatabase={forceResetDatabase}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar with prominent user profile and Logout */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-all active:scale-95"
              title="Mở menu điều hành"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">Hệ thống số hóa xã</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block"></span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {accounts.find(a => a.username === user)?.role || 'Cán bộ'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-2.5 border-r border-slate-100 pr-3 sm:pr-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
                {(accounts.find(a => a.username === user)?.fullName || user || '').charAt(0).toUpperCase()}
              </div>
              <div className="hidden xs:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {accounts.find(a => a.username === user)?.fullName || user}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">@{user}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 hover:border-red-200 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Đăng xuất khỏi tài khoản"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xs:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {renderActiveView()}
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-[9999] max-w-sm w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-4 flex items-start gap-3 border-l-4 border-l-emerald-500"
          >
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông báo hệ thống</h4>
              <p className="text-xs text-slate-600 font-semibold mt-1 leading-relaxed">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
