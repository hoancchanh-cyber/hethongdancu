import React, { useState } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Download, 
  TrendingUp, 
  Users, 
  Building2, 
  Sprout, 
  PieChart, 
  Activity, 
  Map,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Citizen, Household, LandPlot, LocalPlan } from '../types';

interface BaoCaoViewProps {
  citizens: Citizen[];
  households: Household[];
  plots: LandPlot[];
  plans: LocalPlan[];
}

export default function BaoCaoView({
  citizens,
  households,
  plots,
  plans
}: BaoCaoViewProps) {
  const [activeReportTab, setActiveReportTab] = useState<'demographics' | 'agriculture' | 'social'>('demographics');

  // Compute stats
  const totalCitizens = citizens.length;
  const totalHouseholds = households.length;
  const totalPlots = plots.length;
  const totalArea = plots.reduce((acc, p) => acc + p.area, 0);

  // 1. Demographics: Age distribution
  const currentYear = new Date().getFullYear();
  const ageBuckets = {
    under18: 0, // Kids
    adults18to35: 0, // Youth
    adults36to60: 0, // Middle age
    senior60plus: 0 // Seniors
  };

  citizens.forEach(c => {
    const dobStr = String(c.dob || '');
    const birthYear = parseInt(dobStr.includes('-') ? dobStr.split('-')[0] : dobStr) || 1990;
    const age = currentYear - birthYear;
    if (age < 18) ageBuckets.under18++;
    else if (age <= 35) ageBuckets.adults18to35++;
    else if (age <= 60) ageBuckets.adults36to60++;
    else ageBuckets.senior60plus++;
  });

  // 2. Household stats: Standard vs Near poor vs Poor
  const hStats = {
    standard: households.filter(h => h.status === 'Thường').length,
    nearPoor: households.filter(h => h.status === 'Cận nghèo').length,
    poor: households.filter(h => h.status === 'Nghèo').length
  };

  // 3. Agriculture: Area distribution by type
  const plotTypeStats = plots.reduce((acc: { [key: string]: { count: number; area: number } }, plot) => {
    if (!acc[plot.type]) {
      acc[plot.type] = { count: 0, area: 0 };
    }
    acc[plot.type].count++;
    acc[plot.type].area += plot.area;
    return acc;
  }, {});

  // Gender demographics count
  const genders = {
    nam: citizens.filter(c => c.gender === 'Nam').length,
    nu: citizens.filter(c => c.gender === 'Nữ').length,
    khac: citizens.filter(c => c.gender === 'Khác').length
  };

  // CSV Exporter
  const handleExportCSV = (type: 'citizens' | 'households' | 'plots') => {
    let csvContent = "";
    let fileName = "";

    if (type === 'citizens') {
      fileName = "BaoCao_DanhSach_CongDan.csv";
      // UTF-8 BOM to prevent excel Vietnamese characters error
      csvContent = "\uFEFF";
      csvContent += "Số Định Danh (CCCD),Họ Và Tên,Ngày Sinh,Giới Tính,Số Điện Thoại,Nghề Nghiệp,Mã Hộ Khẩu,Chủ Hộ?\n";
      citizens.forEach(c => {
        csvContent += `"${c.id}","${c.fullName}","${c.dob}","${c.gender}","${c.phone}","${c.occupation}","${c.householdId}","${c.isHouseholder ? 'Chủ hộ' : 'Thành viên'}"\n`;
      });
    } else if (type === 'households') {
      fileName = "BaoCao_DanhSach_HoDan.csv";
      csvContent = "\uFEFF";
      csvContent += "Mã Hộ Khẩu,Tên Chủ Hộ,Địa Chỉ,Số Thành Viên,Số Điện Thoại,Phân Loại,Diện Tích Đất Canh Tác (m2)\n";
      households.forEach(h => {
        csvContent += `"${h.id}","${h.householderName}","${h.address}","${h.memberCount}","${h.phone}","${h.status}","${h.landArea}"\n`;
      });
    } else if (type === 'plots') {
      fileName = "BaoCao_DanhSach_ThuaDat.csv";
      csvContent = "\uFEFF";
      csvContent += "Mã Thửa Đất,Mã Hộ Sở Hữu,Loại Đất,Diện Tích (m2),Vị Trí Cánh Đồng,Cây Trồng Vật Nuôi\n";
      plots.forEach(p => {
        csvContent += `"${p.id}","${p.householdId}","${p.type}","${p.area}","${p.location}","${p.currentCrop}"\n`;
      });
    }

    // Trigger download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Thống Kê & Báo Cáo Số Liệu</h1>
          <p className="text-slate-500 text-xs mt-1">
            Tổng quan biểu đồ phân tích mật độ dân cư, hoàn cảnh kinh tế hộ gia đình và tỷ lệ sử dụng đất nông thôn mới toàn xã.
          </p>
        </div>
        
        {/* CSV export dropdown action panel */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleExportCSV('citizens')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel Công Dân</span>
          </button>
          <button
            onClick={() => handleExportCSV('households')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>Xuất Excel Hộ Dân</span>
          </button>
          <button
            onClick={() => handleExportCSV('plots')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>Xuất Excel Thửa Đất</span>
          </button>
        </div>
      </div>

      {/* Grid quick stats summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Cư dân Xã</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-display">{totalCitizens}</p>
          <span className="text-[10px] text-blue-600 font-medium">Nam: {genders.nam} | Nữ: {genders.nu}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Hộ dân số bộ</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-display">{totalHouseholds}</p>
          <span className="text-[10px] text-red-600 font-medium">Nghèo & cận nghèo: {hStats.poor + hStats.nearPoor} hộ</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Quỹ Đất Đăng Ký</span>
            <Map className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-display">{totalArea.toLocaleString()} m²</p>
          <span className="text-[10px] text-emerald-600 font-medium">Phân bố trên {totalPlots} thửa đất</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Nhiệm vụ trọng điểm</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-display">
            {plans.filter(p => p.status === 'Đã hoàn thành').length}/{plans.length}
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Công tác chính sách nông thôn</span>
        </div>
      </div>

      {/* Main interactive sub-sections of charts */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        {/* Toggle subtabs */}
        <div className="flex border-b border-slate-100 pb-3 gap-6">
          <button
            onClick={() => setActiveReportTab('demographics')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 px-0.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeReportTab === 'demographics' 
                ? 'border-emerald-600 text-emerald-800' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Mật Độ & Độ Tuổi</span>
          </button>

          <button
            onClick={() => setActiveReportTab('agriculture')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 px-0.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeReportTab === 'agriculture' 
                ? 'border-amber-600 text-amber-800' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Cơ Cấu Canh Tác Đất</span>
          </button>

          <button
            onClick={() => setActiveReportTab('social')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 px-0.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeReportTab === 'social' 
                ? 'border-indigo-600 text-indigo-800' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>An Sinh Xã Hội</span>
          </button>
        </div>

        {/* 1. Demographics tab */}
        {activeReportTab === 'demographics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
            {/* Age demographic visual SVG chart */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xs uppercase text-slate-700 tracking-wide">
                Phân bổ độ tuổi dân cư xã (Dân số học)
              </h3>
              
              <div className="space-y-4 pt-2">
                {[
                  { label: "Dưới 18 tuổi (Học sinh/Trẻ em)", count: ageBuckets.under18, color: "bg-blue-500", rawColor: "#3b82f6" },
                  { label: "Từ 18 đến 35 tuổi (Thanh niên/Lao động trẻ)", count: ageBuckets.adults18to35, color: "bg-emerald-500", rawColor: "#10b981" },
                  { label: "Từ 36 đến 60 tuổi (Lao động trung niên)", count: ageBuckets.adults36to60, color: "bg-amber-500", rawColor: "#f59e0b" },
                  { label: "Trên 60 tuổi (Người cao tuổi/Hưu trí)", count: ageBuckets.senior60plus, color: "bg-purple-500", rawColor: "#a855f7" }
                ].map((bucket, idx) => {
                  const percentage = totalCitizens > 0 ? (bucket.count / totalCitizens) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>{bucket.label}</span>
                        <span className="font-mono font-bold text-slate-800">{bucket.count} người ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className={`h-full ${bucket.color}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gender demographics drawing */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-display font-bold text-xs uppercase text-slate-700 tracking-wide text-center mb-4">
                Tỷ lệ giới tính cư dân toàn xã
              </h3>
              
              {/* Beautiful custom vector representation */}
              <div className="flex justify-around items-center h-40">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl mx-auto shadow-inner border border-blue-200">
                    {genders.nam}
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Nam</p>
                  <p className="text-[10px] font-mono text-slate-400">
                    {totalCitizens > 0 ? ((genders.nam / totalCitizens) * 100).toFixed(1) : 0}%
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xl mx-auto shadow-inner border border-pink-200">
                    {genders.nu}
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Nữ</p>
                  <p className="text-[10px] font-mono text-slate-400">
                    {totalCitizens > 0 ? ((genders.nu / totalCitizens) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center italic">
                * Thống kê dựa trên cơ sở dữ liệu quốc gia về dân cư đã đồng bộ cục bộ tại địa phương.
              </p>
            </div>
          </div>
        )}

        {/* 2. Agriculture distribution tab */}
        {activeReportTab === 'agriculture' && (
          <div className="space-y-6 pt-2">
            <h3 className="font-display font-bold text-xs uppercase text-slate-700 tracking-wide">
              Mật độ phân bổ diện tích canh tác lúa, cây ăn trái & thủy sản
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(plotTypeStats).map(([type, stats]) => {
                const areaPercentage = totalArea > 0 ? (stats.area / totalArea) * 100 : 0;
                let cardColor = "border-amber-100 bg-amber-50/20 text-amber-800";
                if (type === 'Nuôi trồng thủy sản') cardColor = "border-blue-100 bg-blue-50/20 text-blue-800";
                if (type === 'Chăn nuôi') cardColor = "border-orange-100 bg-orange-50/20 text-orange-800";
                if (type === 'Trồng cây ăn quả') cardColor = "border-emerald-100 bg-emerald-50/20 text-emerald-800";

                return (
                  <div key={type} className={`p-4 rounded-xl border ${cardColor} space-y-2`}>
                    <p className="text-[10px] uppercase font-bold tracking-wider">{type}</p>
                    <p className="text-lg font-bold font-display">{stats.area.toLocaleString()} m²</p>
                    <div className="flex justify-between text-[11px] opacity-80 font-semibold">
                      <span>Số thửa: {stats.count}</span>
                      <span>Chiếm: {areaPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Beautiful visual chart comparing total area of categories */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Đồ thị so sánh quỹ đất sản xuất (m²)</h4>
              <div className="flex h-44 items-end gap-6 pt-6 px-4">
                {Object.entries(plotTypeStats).map(([type, stats]) => {
                  const maxHeight = 120; // max height in pixels
                  // Find max area for scaling
                  const maxArea = Math.max(...Object.values(plotTypeStats).map(s => s.area));
                  const height = maxArea > 0 ? (stats.area / maxArea) * maxHeight : 0;
                  
                  let barColor = "bg-amber-500";
                  if (type === 'Nuôi trồng thủy sản') barColor = "bg-blue-500";
                  if (type === 'Chăn nuôi') barColor = "bg-orange-500";
                  if (type === 'Trồng cây ăn quả') barColor = "bg-emerald-500";

                  return (
                    <div key={type} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-600">{(stats.area / 1000).toFixed(1)}k m²</span>
                      <div className={`w-12 ${barColor} rounded-t-lg transition-all duration-500`} style={{ height: `${height}px` }}></div>
                      <span className="text-[10px] text-slate-500 font-semibold text-center truncate w-full">{type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. Social wellbeing tab */}
        {activeReportTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xs uppercase text-slate-700 tracking-wide">
                Báo cáo tỷ lệ hộ nghèo & cận nghèo toàn xã
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đánh giá chỉ tiêu xóa đói giảm nghèo của ban chỉ đạo xây dựng nông thôn mới. Các hộ nghèo, cận nghèo được hưởng hỗ trợ chính sách trực tiếp hàng tháng.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { label: "Hộ Bình Thường / Đủ điều kiện kinh tế", count: hStats.standard, percentage: (hStats.standard / totalHouseholds) * 100, color: "bg-emerald-500" },
                  { label: "Hộ Cận Nghèo (Cận mức an sinh xã hội)", count: hStats.nearPoor, percentage: (hStats.nearPoor / totalHouseholds) * 100, color: "bg-amber-500" },
                  { label: "Hộ Nghèo (Đặc biệt khó khăn)", count: hStats.poor, percentage: (hStats.poor / totalHouseholds) * 100, color: "bg-red-500" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>{item.label}</span>
                      <span className="font-mono font-bold text-slate-800">{item.count} hộ ({totalHouseholds > 0 ? item.percentage.toFixed(1) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${totalHouseholds > 0 ? item.percentage : 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Descriptive block of agricultural progress / support info */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-600" />
                Hướng xử lý chỉ tiêu nông thôn mới
              </h4>
              <div className="text-xs text-slate-600 space-y-2.5">
                <p>
                  1. Rà soát, khớp nối dữ liệu diện tích đất nông nghiệp của <strong>{hStats.poor} hộ nghèo</strong> nhằm định hướng hỗ trợ hạt giống, vật tư phân bón lót miễn phí từ trạm khuyến nông huyện.
                </p>
                <p>
                  2. Khuyến khích chăn nuôi chuỗi gia súc, tập huấn nông nghiệp VietGAP định kỳ cho <strong>{hStats.nearPoor} hộ cận nghèo</strong> sớm thoát nghèo bền vững cuối vụ thu đông 2026.
                </p>
                <p>
                  3. UBND Xã phối hợp cùng Ngân hàng Chính sách xã hội tạo điều kiện giải ngân vốn vay ưu đãi với lãi suất cực thấp cho phát triển kinh tế tập thể gia đình.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
