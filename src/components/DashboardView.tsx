import React from 'react';
import { 
  Users, 
  Building2, 
  Sprout, 
  ClipboardCheck, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  BookOpen, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { Citizen, Household, LandPlot, LocalPlan, FarmingLog } from '../types';

interface DashboardViewProps {
  citizens: Citizen[];
  households: Household[];
  plots: LandPlot[];
  plans: LocalPlan[];
  logs: FarmingLog[];
  onTabChange: (tab: string) => void;
  onAddCitizen: () => void;
  onAddHousehold: () => void;
  onAddFarmingLog: () => void;
}

export default function DashboardView({
  citizens,
  households,
  plots,
  plans,
  logs,
  onTabChange,
  onAddCitizen,
  onAddHousehold,
  onAddFarmingLog
}: DashboardViewProps) {
  // Compute key stats
  const totalCitizens = citizens.length;
  const totalHouseholds = households.length;
  const totalPlots = plots.length;
  const totalArea = plots.reduce((acc, plot) => acc + plot.area, 0);
  
  const completedPlans = plans.filter(p => p.status === 'Đã hoàn thành').length;
  const totalPlans = plans.length;

  const poorHouseholds = households.filter(h => h.status === 'Nghèo').length;
  const nearPoorHouseholds = households.filter(h => h.status === 'Cận nghèo').length;

  // Agricultural breakdowns
  const plotTypes = plots.reduce((acc: { [key: string]: number }, plot) => {
    acc[plot.type] = (acc[plot.type] || 0) + plot.area;
    return acc;
  }, {});

  // Date formatted today
  const todayStr = "Thứ Bảy, ngày 18 tháng 7 năm 2026";

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header section */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-20 -translate-y-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="bg-emerald-700/60 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-600/30">
              Ban Nhân Dân Thôn
            </span>
            <h1 className="font-display font-bold text-2xl lg:text-3xl mt-3 tracking-tight">
              Xin chào Đồng Chí Cán Bộ!
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
              Hệ thống thông tin số hóa hỗ trợ cập nhật dữ liệu dân cư, quản lý đất sản xuất nông nghiệp, lập báo cáo thống kê và giám sát tiến độ thực hiện kế hoạch nông thôn mới.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex items-center gap-3 self-start md:self-auto shrink-0">
            <Calendar className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Thời gian làm việc</p>
              <p className="text-xs font-semibold">{todayStr}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tổng Công Dân</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{totalCitizens}</p>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Thường trú tại địa phương</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Số Hộ Dân</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{totalHouseholds}</p>
            <p className="text-[11px] text-red-600 font-medium mt-0.5">
              {poorHouseholds} hộ nghèo | {nearPoorHouseholds} cận nghèo
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Đất Nông Nghiệp</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{totalArea.toLocaleString()} m²</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Tổng số {totalPlots} thửa canh tác</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tiến Độ Kế Hoạch</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-display">{completedPlans}/{totalPlans}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Nhiệm vụ hoàn thành</p>
          </div>
        </div>
      </div>

      {/* Grid of details & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Quick Actions & Land Breakdown */}
        <div className="space-y-6 lg:col-span-1">
          {/* Quick Action Widget */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">Thao Tác Nhanh</h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              <button 
                onClick={onAddCitizen}
                className="w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-slate-700 hover:text-emerald-800 rounded-xl flex items-center gap-3 transition-all text-xs font-semibold text-left"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Khai báo Thêm Công Dân Mới</span>
              </button>
              
              <button 
                onClick={onAddHousehold}
                className="w-full p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 text-slate-700 hover:text-indigo-800 rounded-xl flex items-center gap-3 transition-all text-xs font-semibold text-left"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Khai báo Thêm Hộ Dân Mới</span>
              </button>

              <button 
                onClick={onAddFarmingLog}
                className="w-full p-3 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 text-slate-700 hover:text-amber-800 rounded-xl flex items-center gap-3 transition-all text-xs font-semibold text-left"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>Ghi Nhật Ký Đồng Áng Mới</span>
              </button>

              <button 
                onClick={() => onTabChange('sotay')}
                className="w-full p-3 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 text-slate-700 hover:text-teal-800 rounded-xl flex items-center gap-3 transition-all text-xs font-semibold text-left"
              >
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Tra cứu Sổ tay Kỹ thuật</span>
              </button>
            </div>
          </div>

          {/* Land breakdown Widget */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">Cơ Cấu Sử Dụng Đất</h3>
            
            <div className="space-y-3.5">
              {Object.entries(plotTypes).map(([type, area]) => {
                const percentage = totalArea > 0 ? (area / totalArea) * 100 : 0;
                let barColor = "bg-emerald-600";
                if (type === "Trồng lúa") barColor = "bg-yellow-500";
                if (type === "Nuôi trồng thủy sản") barColor = "bg-blue-500";
                if (type === "Chăn nuôi") barColor = "bg-orange-500";
                
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{type}</span>
                      <span className="text-slate-500 font-mono">{(area).toLocaleString()} m² ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Notifications & Farming logs & Active Plans */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Government circular notification center */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Thông báo Khẩn cấp & Chỉ đạo Điều hành
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 font-mono">Dự báo khí tượng | 18/07/2026</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">Ứng phó thời tiết nắng nóng cực đoan kéo dài</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    UBND Xã chỉ đạo Trạm bơm liên tục cung cấp nước cho các khu vực gieo sạ, vận động bà con thăm đồng buổi sáng sớm và chiều mát để bảo vệ mạ mới cấy.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 font-mono">Kế hoạch Y tế | 15/07/2026</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">Tiêm phòng dại chó mèo đợt 2 bổ sung</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Cán bộ Thú y xóm tiếp tục rà soát các hộ nuôi chó mèo chưa tiêm phòng để tiến hành bổ sung vào cuối tuần này.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Farming Activity Logs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">Nhật Ký Đồng Áng Gần Đây</h3>
              <button 
                onClick={() => onTabChange('nongnghiep')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {logs.slice(0, 4).map((log) => {
                const plot = plots.find(p => p.id === log.landPlotId);
                const household = plot ? households.find(h => h.id === plot.householdId) : null;
                
                return (
                  <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-start gap-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">{log.activity}</h4>
                      <div className="flex flex-wrap gap-x-2 text-slate-500 mt-0.5 font-mono">
                        <span>Thửa: {log.landPlotId} - {plot?.type} ({plot?.currentCrop})</span>
                        <span>•</span>
                        <span>Hộ: {household?.householderName}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{log.notes}</p>
                    </div>
                    <span className="text-slate-400 font-mono shrink-0 font-medium">{log.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local projects progress */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">Tiến độ công việc trọng điểm</h3>
              <button 
                onClick={() => onTabChange('kehoach')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
              >
                <span>Xem chi tiết</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {plans.slice(0, 3).map((plan) => {
                let statusStyle = "bg-amber-100 text-amber-800";
                if (plan.status === 'Đã hoàn thành') statusStyle = "bg-emerald-100 text-emerald-800";
                if (plan.status === 'Chưa bắt đầu') statusStyle = "bg-slate-100 text-slate-700";

                return (
                  <div key={plan.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{plan.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Phụ trách: {plan.assignee}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusStyle} shrink-0`}>
                      {plan.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
