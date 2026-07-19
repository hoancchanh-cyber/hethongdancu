import React, { useState } from 'react';
import { 
  Sprout, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  MapPin, 
  Search, 
  BookOpen, 
  X, 
  AlertCircle,
  FileText,
  User,
  Activity,
  Info
} from 'lucide-react';
import { LandPlot, FarmingLog, Household } from '../types';

interface NongNghiepViewProps {
  plots: LandPlot[];
  logs: FarmingLog[];
  households: Household[];
  onAddPlot: (plot: LandPlot) => void;
  onUpdatePlot: (plot: LandPlot) => void;
  onDeletePlot: (id: string) => void;
  onAddFarmingLog: (log: FarmingLog) => void;
  onDeleteFarmingLog: (id: string) => void;
  isFarmingLogModalOpen?: boolean;
  setIsFarmingLogModalOpen?: (isOpen: boolean) => void;
}

export default function NongNghiepView({
  plots,
  logs,
  households,
  onAddPlot,
  onUpdatePlot,
  onDeletePlot,
  onAddFarmingLog,
  onDeleteFarmingLog,
  isFarmingLogModalOpen = false,
  setIsFarmingLogModalOpen
}: NongNghiepViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'plots' | 'logs'>('plots');
  const [plotSearchTerm, setPlotSearchTerm] = useState('');
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [hoveredPlotId, setHoveredPlotId] = useState<string | null>(null);

  // Helper to assign coordinates dynamically for map presentation
  const getPlotCoords = (plot: LandPlot, index: number) => {
    const predefinedCoords: { [key: string]: { x: number; y: number; w: number; h: number } } = {
      "LP001": { x: 40, y: 50, w: 160, h: 100 },
      "LP003": { x: 210, y: 50, w: 130, h: 100 },
      "LP002": { x: 350, y: 50, w: 120, h: 100 },
      "LP006": { x: 480, y: 50, w: 180, h: 220 },
      "LP005": { x: 40, y: 160, w: 180, h: 110 },
      "LP004": { x: 230, y: 160, w: 240, h: 110 },
    };

    if (predefinedCoords[plot.id]) {
      return predefinedCoords[plot.id];
    }

    const predefinedIds = Object.keys(predefinedCoords);
    const existingPredefinedCount = plots.filter(p => predefinedIds.includes(p.id)).length;
    const dynamicIndex = index - existingPredefinedCount;
    const col = Math.max(0, dynamicIndex) % 4;
    const row = Math.floor(Math.max(0, dynamicIndex) / 4);
    return {
      x: 40 + col * 175,
      y: 285 + row * 95,
      w: 165,
      h: 85
    };
  };

  // Plot Form states
  const [isPlotFormOpen, setIsPlotFormOpen] = useState(false);
  const [plotFormMode, setPlotFormMode] = useState<'add' | 'edit'>('add');
  const [plotFormError, setPlotFormError] = useState('');
  const [plotFormData, setPlotFormData] = useState<Partial<LandPlot>>({
    id: '',
    householdId: '',
    type: 'Trồng lúa',
    area: 100,
    location: '',
    currentCrop: ''
  });

  // Log Form states (independent, handles trigger from dashboard too)
  const [isLocalLogFormOpen, setIsLocalLogFormOpen] = useState(false);
  const [logFormError, setLogFormError] = useState('');
  const [logFormData, setLogFormData] = useState<Partial<FarmingLog>>({
    id: '',
    landPlotId: '',
    activity: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const isLogFormCurrentlyOpen = isFarmingLogModalOpen || isLocalLogFormOpen;
  const setLogFormOpenState = (isOpen: boolean) => {
    if (setIsFarmingLogModalOpen) {
      setIsFarmingLogModalOpen(isOpen);
    } else {
      setIsLocalLogFormOpen(isOpen);
    }
  };

  const resetPlotForm = () => {
    setPlotFormData({
      id: '',
      householdId: households[0]?.id || '',
      type: 'Trồng lúa',
      area: 100,
      location: '',
      currentCrop: ''
    });
    setPlotFormError('');
  };

  const resetLogForm = () => {
    setLogFormData({
      id: `FL${Math.floor(100 + Math.random() * 900)}`,
      landPlotId: plots[0]?.id || '',
      activity: 'Bón phân thúc',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setLogFormError('');
  };

  const handleOpenAddPlot = () => {
    setPlotFormMode('add');
    resetPlotForm();
    setIsPlotFormOpen(true);
  };

  const handleOpenEditPlot = (plot: LandPlot) => {
    setPlotFormMode('edit');
    setPlotFormData(plot);
    setPlotFormError('');
    setIsPlotFormOpen(true);
  };

  const handleOpenAddLog = () => {
    resetLogForm();
    setLogFormOpenState(true);
  };

  const validatePlotForm = () => {
    if (!plotFormData.id || !plotFormData.id.trim()) {
      setPlotFormError('Mã thửa đất không được để trống.');
      return false;
    }
    if (!plotFormData.householdId) {
      setPlotFormError('Vui lòng gán chủ sở hữu hộ gia đình.');
      return false;
    }
    if (!plotFormData.area || plotFormData.area <= 0) {
      setPlotFormError('Diện tích thửa đất phải lớn hơn 0 m².');
      return false;
    }
    if (!plotFormData.location || !plotFormData.location.trim()) {
      setPlotFormError('Vui lòng chỉ định vị trí cánh đồng/khu vực.');
      return false;
    }
    if (plotFormMode === 'add' && plots.some(p => p.id === plotFormData.id)) {
      setPlotFormError('Mã thửa đất này đã tồn tại trong danh bộ xã.');
      return false;
    }
    return true;
  };

  const handlePlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePlotForm()) return;

    const plotToSave = plotFormData as LandPlot;
    if (plotFormMode === 'add') {
      onAddPlot(plotToSave);
    } else {
      onUpdatePlot(plotToSave);
    }
    setIsPlotFormOpen(false);
    resetPlotForm();
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logFormData.landPlotId) {
      setLogFormError('Vui lòng lựa chọn thửa đất canh tác.');
      return;
    }
    if (!logFormData.activity || !logFormData.activity.trim()) {
      setLogFormError('Vui lòng nhập tên hoạt động sản xuất nông nghiệp.');
      return;
    }
    if (!logFormData.date) {
      setLogFormError('Vui lòng chỉ định ngày thực hiện.');
      return;
    }

    const logToSave = {
      id: logFormData.id || `FL${Date.now().toString().slice(-4)}`,
      landPlotId: logFormData.landPlotId,
      activity: logFormData.activity,
      date: logFormData.date,
      notes: logFormData.notes || ''
    } as FarmingLog;

    onAddFarmingLog(logToSave);
    setLogFormOpenState(false);
    resetLogForm();
  };

  // Filter land plots
  const filteredPlots = plots.filter((plot) => {
    const hh = households.find(h => h.id === plot.householdId);
    const matchesSearch = 
      (plot.id || '').toLowerCase().includes((plotSearchTerm || '').toLowerCase()) ||
      (plot.location || '').toLowerCase().includes((plotSearchTerm || '').toLowerCase()) ||
      (plot.currentCrop || '').toLowerCase().includes((plotSearchTerm || '').toLowerCase()) ||
      (hh && (hh.householderName || '').toLowerCase().includes((plotSearchTerm || '').toLowerCase()));
    return matchesSearch;
  });

  // Filter farming logs
  const filteredLogs = logs.filter((log) => {
    const plot = plots.find(p => p.id === log.landPlotId);
    const hh = plot ? households.find(h => h.id === plot.householdId) : null;
    const matchesSearch = 
      (log.activity || '').toLowerCase().includes((logSearchTerm || '').toLowerCase()) ||
      (log.notes || '').toLowerCase().includes((logSearchTerm || '').toLowerCase()) ||
      (log.landPlotId || '').toLowerCase().includes((logSearchTerm || '').toLowerCase()) ||
      (hh && (hh.householderName || '').toLowerCase().includes((logSearchTerm || '').toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Số Hóa Nông Nghiệp</h1>
          <p className="text-slate-500 text-xs mt-1">
            Theo dõi phân bố đất trồng trọt, vật nuôi, cây trồng chính của từng hộ gia đình và nhật ký chăm sóc nông sản của toàn xã.
          </p>
        </div>
        <div className="flex gap-2">
          {activeSubTab === 'plots' ? (
            <button
              onClick={handleOpenAddPlot}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Thửa Đất</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddLog}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi Nhật Ký Sản Xuất</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          onClick={() => setActiveSubTab('plots')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all flex items-center gap-2 ${
            activeSubTab === 'plots' 
              ? 'border-emerald-600 text-emerald-800' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Bản đồ Thửa Đất ({plots.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all flex items-center gap-2 ${
            activeSubTab === 'logs' 
              ? 'border-amber-600 text-amber-800' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Nhật Ký Đồng Áng ({logs.length})</span>
        </button>
      </div>

      {/* Plots list sub-tab */}
      {activeSubTab === 'plots' && (
        <div className="space-y-6">
          {/* Interactive Digitized Land Map Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600 animate-pulse" />
                  <span>Bản Đồ Không Gian Địa Chính & Quy Hoạch Xã</span>
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Mô phỏng sơ đồ phân bố thực địa toàn xã. Rê chuột (hover) để xem nhanh, click vào thửa đất để định vị nhanh trong danh bộ bên dưới.
                </p>
              </div>
              {/* Map Legend */}
              <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-500/20 border border-amber-500"></span>
                  <span>Trồng lúa</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500"></span>
                  <span>Cây quả</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-blue-500/20 border border-blue-500"></span>
                  <span>Thủy sản</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-orange-500/20 border border-orange-500"></span>
                  <span>Chăn nuôi</span>
                </div>
              </div>
            </div>

            {/* SVG Map Board */}
            <div className="relative bg-slate-50/60 border border-slate-200/60 rounded-xl overflow-hidden shadow-inner">
              <div className="overflow-x-auto p-4 flex justify-center">
                <div className="min-w-[700px] w-full max-w-4xl relative">
                  <svg viewBox="0 0 800 420" className="w-full h-auto select-none font-sans">
                    {/* Background Grid Pattern */}
                    <defs>
                      <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#mapGrid)" rx="8" />

                    {/* Blue River / Irrigation Stream running across the map */}
                    <path 
                      d="M -10 140 Q 200 120 400 170 T 810 150" 
                      fill="none" 
                      stroke="#f0f9ff" 
                      strokeWidth="24" 
                      strokeLinecap="round"
                    />
                    <path 
                      d="M -10 140 Q 200 120 400 170 T 810 150" 
                      fill="none" 
                      stroke="#e0f2fe" 
                      strokeWidth="10" 
                      strokeLinecap="round"
                    />
                    <text x="630" y="130" fill="#0369a1" className="text-[9px] font-bold italic tracking-wider opacity-60">Sông Vàm Cỏ Đông</text>

                    {/* Local main road pathway */}
                    <path 
                      d="M 10 390 L 790 390" 
                      fill="none" 
                      stroke="#e2e8f0" 
                      strokeWidth="14" 
                      strokeLinecap="round"
                    />
                    <path 
                      d="M 10 390 L 790 390" 
                      fill="none" 
                      stroke="#ffffff" 
                      strokeWidth="2" 
                      strokeDasharray="6 6" 
                      strokeLinecap="round"
                    />
                    <text x="320" y="383" fill="#475569" className="text-[8px] font-bold uppercase tracking-wider">Trục lộ giao thông chính liên xã</text>

                    {/* Irrigation canal branching off */}
                    <path
                      d="M 200 155 L 200 10"
                      fill="none"
                      stroke="#bae6fd"
                      strokeWidth="5"
                    />
                    <text x="210" y="30" fill="#0284c7" className="text-[7px] font-bold uppercase tracking-wider opacity-65">Kênh dẫn nước nội đồng</text>

                    {/* Sector Geographical Labels */}
                    <text x="110" y="30" fill="#cbd5e1" className="text-[10px] font-bold uppercase tracking-widest">Cánh đồng Đồng Trong</text>
                    <text x="500" y="30" fill="#cbd5e1" className="text-[10px] font-bold uppercase tracking-widest">Phân khu Đồi Bãi Màu</text>
                    <text x="80" y="320" fill="#cbd5e1" className="text-[10px] font-bold uppercase tracking-widest">Trang trại Hòa Bình</text>
                    <text x="580" y="320" fill="#cbd5e1" className="text-[10px] font-bold uppercase tracking-widest">Đất quy hoạch mới</text>

                    {/* Map Polygons for plots */}
                    {plots.map((plot, idx) => {
                      const coords = getPlotCoords(plot, idx);
                      const isSelected = selectedPlotId === plot.id;
                      const isHovered = hoveredPlotId === plot.id;
                      const owner = households.find(h => h.id === plot.householdId);

                      let fill = "fill-amber-500/10";
                      let stroke = "stroke-amber-400";
                      let hoverFill = "hover:fill-amber-500/25";
                      let textFill = "fill-amber-900";

                      if (plot.type === "Trồng lúa") {
                        fill = isSelected ? "fill-amber-500/35" : "fill-amber-500/15";
                        stroke = isSelected ? "stroke-amber-600 stroke-2" : "stroke-amber-400/80";
                        hoverFill = "hover:fill-amber-500/30";
                        textFill = "fill-amber-900";
                      } else if (plot.type === "Trồng cây ăn quả") {
                        fill = isSelected ? "fill-emerald-500/35" : "fill-emerald-500/15";
                        stroke = isSelected ? "stroke-emerald-600 stroke-2" : "stroke-emerald-400/80";
                        hoverFill = "hover:fill-emerald-500/30";
                        textFill = "fill-emerald-900";
                      } else if (plot.type === "Nuôi trồng thủy sản") {
                        fill = isSelected ? "fill-blue-500/35" : "fill-blue-500/15";
                        stroke = isSelected ? "stroke-blue-600 stroke-2" : "stroke-blue-400/80";
                        hoverFill = "hover:fill-blue-500/30";
                        textFill = "fill-blue-900";
                      } else if (plot.type === "Chăn nuôi") {
                        fill = isSelected ? "fill-orange-500/35" : "fill-orange-500/15";
                        stroke = isSelected ? "stroke-orange-600 stroke-2" : "stroke-orange-400/80";
                        hoverFill = "hover:fill-orange-500/30";
                        textFill = "fill-orange-900";
                      }

                      return (
                        <g
                          key={plot.id}
                          className="cursor-pointer transition-all duration-150"
                          onClick={() => {
                            if (selectedPlotId === plot.id) {
                              setSelectedPlotId(null);
                              setPlotSearchTerm('');
                            } else {
                              setSelectedPlotId(plot.id);
                              setPlotSearchTerm(plot.id);
                            }
                          }}
                          onMouseEnter={() => setHoveredPlotId(plot.id)}
                          onMouseLeave={() => setHoveredPlotId(null)}
                        >
                          {/* Map Parcel rect shape */}
                          <rect
                            x={coords.x}
                            y={coords.y}
                            width={coords.w}
                            height={coords.h}
                            rx="8"
                            className={`${fill} ${stroke} ${hoverFill} transition-all duration-150`}
                            strokeWidth={isSelected || isHovered ? "2.5" : "1"}
                          />

                          {/* Decorative border pattern inside parcel */}
                          <rect
                            x={coords.x + 3}
                            y={coords.y + 3}
                            width={coords.w - 6}
                            height={coords.h - 6}
                            rx="5"
                            fill="none"
                            className={stroke}
                            strokeWidth="0.5"
                            strokeOpacity="0.2"
                          />

                          {/* Parcel ID Text */}
                          <text
                            x={coords.x + coords.w / 2}
                            y={coords.y + coords.h / 2 - 4}
                            textAnchor="middle"
                            className={`text-[10px] font-mono font-bold tracking-tight ${textFill}`}
                          >
                            {plot.id}
                          </text>

                          {/* Crop Name text inside parcel */}
                          <text
                            x={coords.x + coords.w / 2}
                            y={coords.y + coords.h / 2 + 10}
                            textAnchor="middle"
                            className="text-[8px] font-semibold fill-slate-500/90"
                          >
                            {plot.currentCrop.length > 15 ? plot.currentCrop.slice(0, 13) + "..." : plot.currentCrop}
                          </text>

                          {/* Area tag on parcel */}
                          <text
                            x={coords.x + coords.w - 8}
                            y={coords.y + coords.h - 8}
                            textAnchor="end"
                            className="text-[7px] font-mono fill-slate-400 font-bold"
                          >
                            {plot.area} m²
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Tooltip Popup on Hover */}
                  {hoveredPlotId && (() => {
                    const plot = plots.find(p => p.id === hoveredPlotId);
                    if (!plot) return null;
                    const idx = plots.findIndex(p => p.id === hoveredPlotId);
                    const coords = getPlotCoords(plot, idx);
                    const owner = households.find(h => h.id === plot.householdId);

                    let tooltipBorder = "border-amber-200";
                    let tooltipHeaderBg = "bg-amber-500";
                    if (plot.type === "Trồng cây ăn quả") {
                      tooltipBorder = "border-emerald-200";
                      tooltipHeaderBg = "bg-emerald-600";
                    } else if (plot.type === "Nuôi trồng thủy sản") {
                      tooltipBorder = "border-blue-200";
                      tooltipHeaderBg = "bg-blue-600";
                    } else if (plot.type === "Chăn nuôi") {
                      tooltipBorder = "border-orange-200";
                      tooltipHeaderBg = "bg-orange-600";
                    }

                    return (
                      <div 
                        className={`absolute z-10 bg-white rounded-xl shadow-xl border ${tooltipBorder} w-60 overflow-hidden pointer-events-none transition-all duration-100`}
                        style={{
                          left: `${(coords.x + coords.w / 2) / 800 * 100}%`,
                          top: `${(coords.y - 10) / 420 * 100}%`,
                          transform: 'translate(-50%, -100%)',
                        }}
                      >
                        <div className={`${tooltipHeaderBg} px-3 py-1.5 text-white flex justify-between items-center`}>
                          <span className="font-mono font-bold text-xs">Mã thửa: {plot.id}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                            {plot.type}
                          </span>
                        </div>
                        <div className="p-3 text-[11px] space-y-1.5 text-slate-700">
                          <p className="flex justify-between">
                            <span className="text-slate-400">Chủ hộ sở hữu:</span>
                            <strong className="text-slate-800">{owner?.householderName || "N/A"}</strong>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Vị trí địa bàn:</span>
                            <span className="font-medium text-slate-800">{plot.location}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Diện tích canh tác:</span>
                            <strong className="font-mono text-emerald-700">{plot.area.toLocaleString()} m²</strong>
                          </p>
                          <p className="flex justify-between items-center pt-1 border-t border-slate-100">
                            <span className="text-slate-400">Cây trồng / Vật nuôi:</span>
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold text-[10px]">
                              {plot.currentCrop || "Đất trống"}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Reset view label inside map if filtering is active */}
              {selectedPlotId && (
                <div className="absolute bottom-3 right-3 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                  <span>Đang lọc theo thửa <strong>{selectedPlotId}</strong></span>
                  <button 
                    onClick={() => {
                      setSelectedPlotId(null);
                      setPlotSearchTerm('');
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Plot Filter bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Tìm thửa đất theo Mã, Cánh đồng, Giống cây trồng, Chủ sở hữu..."
                value={plotSearchTerm}
                onChange={(e) => setPlotSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
              />
            </div>
          </div>

          {/* Plots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlots.length === 0 ? (
              <div className="col-span-full bg-white p-8 text-center text-slate-400 rounded-2xl border border-slate-100">
                Không tìm thấy thông tin thửa đất nông nghiệp nào.
              </div>
            ) : (
              filteredPlots.map((plot) => {
                const household = households.find(h => h.id === plot.householdId);
                
                let typeBadgeClass = "bg-yellow-50 text-yellow-800 border-yellow-100";
                if (plot.type === "Trồng lúa") typeBadgeClass = "bg-amber-50 text-amber-800 border-amber-100";
                if (plot.type === "Nuôi trồng thủy sản") typeBadgeClass = "bg-blue-50 text-blue-800 border-blue-100";
                if (plot.type === "Chăn nuôi") typeBadgeClass = "bg-orange-50 text-orange-800 border-orange-100";

                return (
                  <div key={plot.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                    <div className="p-5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="bg-emerald-50 text-emerald-800 font-mono font-bold text-xs px-2.5 py-0.5 rounded">
                          Thửa: {plot.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeBadgeClass}`}>
                          {plot.type}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-slate-900 mt-4 flex items-center gap-1.5 text-sm">
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        <span>Sản phẩm: {plot.currentCrop || "Chưa canh tác"}</span>
                      </h3>

                      <div className="mt-4 space-y-2 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Vị trí: {plot.location}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Chủ hộ: <strong className="text-slate-800">{household?.householderName || "N/A"}</strong> ({plot.householdId})</span>
                        </p>
                        <p className="flex items-center gap-1.5 font-mono text-slate-500">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Diện tích: <strong className="text-emerald-700">{plot.area.toLocaleString()}</strong> m²</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditPlot(plot)}
                        className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded text-slate-500 hover:text-emerald-700 transition-all text-xs flex items-center gap-1 font-semibold"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xác nhận xóa thửa đất nông nghiệp ${plot.id}?`)) {
                            onDeletePlot(plot.id);
                          }
                        }}
                        className="p-1.5 hover:bg-white border border-transparent hover:border-red-100 rounded text-slate-500 hover:text-red-600 transition-all text-xs flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Logs list sub-tab */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          {/* Log Filter bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Tìm nhật ký theo Hoạt động, Ghi chú, Mã thửa, Tên hộ..."
                value={logSearchTerm}
                onChange={(e) => setLogSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white rounded-xl text-xs transition-all"
              />
            </div>
          </div>

          {/* Timeline-style logs table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-4 px-6 w-32">Ngày Tháng</th>
                    <th className="py-4 px-6 w-32">Thửa Đất</th>
                    <th className="py-4 px-6">Hoạt Động Kỹ Thuật</th>
                    <th className="py-4 px-6">Người Sản Xuất (Hộ Dân)</th>
                    <th className="py-4 px-6">Nội Dung Chi Tiết / Ghi Chú</th>
                    <th className="py-4 px-6 text-center w-20">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Chưa ghi nhận nhật ký sản xuất nông nghiệp nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const plot = plots.find(p => p.id === log.landPlotId);
                      const hh = plot ? households.find(h => h.id === plot.householdId) : null;
                      
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="py-4 px-6 font-mono font-semibold text-amber-800">{log.date}</td>
                          <td className="py-4 px-6 font-mono font-bold text-emerald-700">{log.landPlotId}</td>
                          <td className="py-4 px-6 font-bold text-slate-900">{log.activity}</td>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-800">{hh?.householderName}</span>
                            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Mã hộ: {plot?.householdId}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 max-w-sm">{log.notes}</td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => {
                                if (window.confirm('Bạn có chắc muốn xóa nhật ký sản xuất này?')) {
                                  onDeleteFarmingLog(log.id);
                                }
                              }}
                              className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-all"
                              title="Xóa nhật ký"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Plot Form Dialog Modal */}
      {isPlotFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wide">
                  {plotFormMode === 'add' ? 'Đăng Ký Thửa Đất Nông Nghiệp' : 'Cập Nhật Thửa Đất'}
                </h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-0.5">Danh bộ địa chính</p>
              </div>
              <button 
                onClick={() => setIsPlotFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePlotSubmit} className="p-6 space-y-4">
              {plotFormError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{plotFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* ID plot */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Mã Thửa Đất (Ví dụ: LP007)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={plotFormMode === 'edit'}
                    placeholder="Nhập mã thửa..."
                    value={plotFormData.id}
                    onChange={(e) => setPlotFormData({ ...plotFormData, id: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all disabled:opacity-50"
                  />
                </div>

                {/* Owner household */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Hộ Đăng Ký Sở Hữu</label>
                  <select
                    value={plotFormData.householdId}
                    onChange={(e) => setPlotFormData({ ...plotFormData, householdId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-xs transition-all"
                  >
                    <option value="">Chọn hộ khẩu...</option>
                    {households.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.id} - {h.householderName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plot Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phân Loại Thửa Đất</label>
                  <select
                    value={plotFormData.type}
                    onChange={(e) => setPlotFormData({ ...plotFormData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-xs transition-all"
                  >
                    <option value="Trồng lúa">Trồng lúa</option>
                    <option value="Trồng cây ăn quả">Trồng cây ăn quả</option>
                    <option value="Nuôi trồng thủy sản">Nuôi trồng thủy sản</option>
                    <option value="Chăn nuôi">Chăn nuôi</option>
                  </select>
                </div>

                {/* Crop or livestock */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Cây Trồng / Vật Nuôi Chính</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Lúa nước ST25, Cam, Bò..."
                    value={plotFormData.currentCrop}
                    onChange={(e) => setPlotFormData({ ...plotFormData, currentCrop: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* Area */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Diện Tích (m²)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={plotFormData.area}
                    onChange={(e) => setPlotFormData({ ...plotFormData, area: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Khu Vực / Tên Cánh Đồng</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đồng Ngoài, Thôn 1..."
                    value={plotFormData.location}
                    onChange={(e) => setPlotFormData({ ...plotFormData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlotFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/10 transition-all"
                >
                  Lưu Thửa Đất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farming Log Form Dialog Modal */}
      {isLogFormCurrentlyOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wide">Ghi Nhận Nhật Ký Chăm Sóc Sức Sản</h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-0.5">Phần nông nghiệp nông thôn</p>
              </div>
              <button 
                onClick={() => setLogFormOpenState(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="p-6 space-y-4">
              {logFormError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{logFormError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Select plot */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Lựa Chọn Thửa Đất Áp Dụng</label>
                  <select
                    value={logFormData.landPlotId}
                    onChange={(e) => setLogFormData({ ...logFormData, landPlotId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-xl text-xs transition-all"
                  >
                    <option value="">Chọn thửa đất...</option>
                    {plots.map((p) => {
                      const owner = households.find(h => h.id === p.householdId);
                      return (
                        <option key={p.id} value={p.id}>
                          Thửa {p.id} - {p.type} ({p.currentCrop || "Đất trống"}) - Hộ: {owner?.householderName || "N/A"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Activity */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tên Hoạt Động Kỹ Thuật</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Bón phân, Phun thuốc, Thu hoạch..."
                      value={logFormData.activity}
                      onChange={(e) => setLogFormData({ ...logFormData, activity: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white rounded-xl text-xs transition-all"
                    />
                  </div>

                  {/* Date log */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ngày Thực Hiện</label>
                    <input
                      type="date"
                      required
                      value={logFormData.date}
                      onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white rounded-xl text-xs transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ghi Chú Chi Tiết Kỹ Thuật</label>
                  <textarea
                    rows={3}
                    placeholder="Ghi loại phân bón, liều lượng, tình hình tăng trưởng dịch bệnh cụ thể..."
                    value={logFormData.notes}
                    onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLogFormOpenState(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-amber-600/10 transition-all"
                >
                  Ghi Nhật Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
