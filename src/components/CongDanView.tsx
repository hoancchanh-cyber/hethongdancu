import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  HelpCircle,
  Contact,
  Info,
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2
} from 'lucide-react';
import { Citizen, Household } from '../types';
import * as XLSX from 'xlsx';

interface CongDanViewProps {
  citizens: Citizen[];
  households: Household[];
  onAddCitizen: (citizen: Citizen) => void;
  onUpdateCitizen: (citizen: Citizen) => void;
  onDeleteCitizen: (id: string) => void;
  onImportCitizens?: (citizens: Citizen[]) => void;
}

export default function CongDanView({
  citizens,
  households,
  onAddCitizen,
  onUpdateCitizen,
  onDeleteCitizen,
  onImportCitizens
}: CongDanViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedHousehold, setSelectedHousehold] = useState('All');
  
  // Excel Import states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validatedRows, setValidatedRows] = useState<{
    rowNumber: number;
    data: Partial<Citizen>;
    isValid: boolean;
    errors: string[];
    isDuplicateInDb: boolean;
  }[]>([]);
  const [importError, setImportError] = useState('');
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'valid' | 'invalid'>('all');

  // Helper to parse Excel dates correctly
  const parseExcelDate = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'number') {
      const date = new Date((val - 25569) * 86400 * 1000);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    
    const str = String(val).trim();
    const dmyRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
    const matchdmy = str.match(dmyRegex);
    if (matchdmy) {
      const d = matchdmy[1].padStart(2, '0');
      const m = matchdmy[2].padStart(2, '0');
      const y = matchdmy[3];
      return `${y}-${m}-${d}`;
    }
    
    const ymdRegex = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;
    const matchymd = str.match(ymdRegex);
    if (matchymd) {
      const y = matchymd[1];
      const m = matchymd[2].padStart(2, '0');
      const d = matchymd[3].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    
    return str;
  };

  // Parse Excel / CSV files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportError('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (jsonData.length < 2) {
          setImportError('Tệp Excel không chứa đủ dữ liệu (yêu cầu ít nhất một dòng tiêu đề và một dòng dữ liệu).');
          return;
        }

        const headers = jsonData[0].map(h => String(h || '').trim());
        const rows = jsonData.slice(1);
        
        const colMap: { [key: string]: number } = {};
        
        const cccdKeys = ["cccd", "định danh", "dinh danh", "số định danh", "so dinh danh", "id", "số cccd", "so cccd"];
        const nameKeys = ["họ tên", "ho ten", "họ và tên", "ho va ten", "tên", "ten", "fullname", "full name", "name"];
        const dobKeys = ["ngày sinh", "ngay sinh", "ngaysinh", "dob", "birth", "ngày sinh (yyyy-mm-dd)"];
        const genderKeys = ["giới tính", "gioi tinh", "gender", "giới tính (nam/nữ/khác)"];
        const phoneKeys = ["số điện thoại", "so dien thoai", "sđt", "sdt", "phone", "điện thoại", "dien thoai"];
        const occupationKeys = ["nghề nghiệp", "nghe nghiep", "occupation", "công việc", "cong viec"];
        const householdKeys = ["mã hộ khẩu", "ma ho khau", "mã hộ", "ma ho", "householdid", "household id"];
        const householderKeys = ["là chủ hộ", "la chu ho", "chủ hộ", "chu ho", "ishouseholder", "is householder", "là chủ hộ (có/không)"];
        const notesKeys = ["ghi chú", "ghi chu", "notes", "ghi chú đặc điểm"];

        headers.forEach((h, idx) => {
          const norm = String(h || '').toLowerCase();
          if (cccdKeys.some(k => norm.includes(k) || k.includes(norm))) colMap['id'] = idx;
          else if (nameKeys.some(k => norm.includes(k) || k.includes(norm))) colMap['fullName'] = idx;
          else if (dobKeys.some(k => norm.includes(k) || k.includes(norm))) colMap['dob'] = idx;
          else if (genderKeys.some(k => norm.includes(k) || k.includes(norm))) colMap['gender'] = idx;
          else if (phoneKeys.some(k => norm.includes(k) || k.includes(norm))) colMap['phone'] = idx;
          else if (occupationKeys.some(k => norm.includes(k) || k.includes(norm))) colMap['occupation'] = idx;
          else if (householdKeys.some(k => norm.includes(k) || k.includes(norm))) colMap['householdId'] = idx;
          else if (householderKeys.some(k => norm.includes(k) || k.includes(norm))) colMap['isHouseholder'] = idx;
          else if (notesKeys.some(k => norm.includes(k) || k.includes(norm))) colMap['notes'] = idx;
        });

        // Fallbacks based on typical spreadsheet columns order: CCCD, Name, DOB, Gender, Phone, Occupation, HouseholdID, IsHouseholder, Notes
        if (colMap['id'] === undefined && headers.length > 0) colMap['id'] = 0;
        if (colMap['fullName'] === undefined && headers.length > 1) colMap['fullName'] = 1;
        if (colMap['dob'] === undefined && headers.length > 2) colMap['dob'] = 2;
        if (colMap['gender'] === undefined && headers.length > 3) colMap['gender'] = 3;
        if (colMap['phone'] === undefined && headers.length > 4) colMap['phone'] = 4;
        if (colMap['occupation'] === undefined && headers.length > 5) colMap['occupation'] = 5;
        if (colMap['householdId'] === undefined && headers.length > 6) colMap['householdId'] = 6;
        if (colMap['isHouseholder'] === undefined && headers.length > 7) colMap['isHouseholder'] = 7;
        if (colMap['notes'] === undefined && headers.length > 8) colMap['notes'] = 8;

        const parsed: any[] = [];
        rows.forEach((row, rowIdx) => {
          if (row.length === 0 || row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) {
            return;
          }
          
          const rawId = colMap['id'] !== undefined ? row[colMap['id']] : '';
          const rawFullName = colMap['fullName'] !== undefined ? row[colMap['fullName']] : '';
          const rawDob = colMap['dob'] !== undefined ? row[colMap['dob']] : '';
          const rawGender = colMap['gender'] !== undefined ? row[colMap['gender']] : 'Nam';
          const rawPhone = colMap['phone'] !== undefined ? row[colMap['phone']] : '';
          const rawOccupation = colMap['occupation'] !== undefined ? row[colMap['occupation']] : '';
          const rawHouseholdId = colMap['householdId'] !== undefined ? row[colMap['householdId']] : '';
          const rawIsHouseholder = colMap['isHouseholder'] !== undefined ? row[colMap['isHouseholder']] : 'Không';
          const rawNotes = colMap['notes'] !== undefined ? row[colMap['notes']] : '';

          let id = String(rawId || '').trim().replace(/\s/g, '');
          if (/^\d+$/.test(id) && id.length < 12) {
            id = id.padStart(12, '0');
          }

          const fullName = String(rawFullName || '').trim();
          const dob = parseExcelDate(rawDob);
          
          let gender: 'Nam' | 'Nữ' | 'Khác' = 'Nam';
          const normGender = String(rawGender || '').trim().toLowerCase();
          if (normGender.includes('nữ') || normGender === 'nu' || normGender === 'female') {
            gender = 'Nữ';
          } else if (normGender.includes('khác') || normGender === 'khac' || normGender === 'other') {
            gender = 'Khác';
          }

          const phone = String(rawPhone || '').trim();
          const occupation = String(rawOccupation || '').trim();
          const householdId = String(rawHouseholdId || '').trim();
          
          const normIsHH = String(rawIsHouseholder || '').trim().toLowerCase();
          const isHouseholder = normIsHH === 'có' || normIsHH === 'co' || normIsHH === 'true' || normIsHH === 'yes' || normIsHH === '1' || normIsHH === 'x';

          const notes = String(rawNotes || '').trim();

          parsed.push({
            rowNumber: rowIdx + 2,
            id,
            fullName,
            dob,
            gender,
            phone,
            occupation,
            householdId,
            isHouseholder,
            notes
          });
        });

        setParsedRows(parsed);
      } catch (err) {
        console.error(err);
        setImportError('Không thể đọc tệp Excel. Vui lòng đảm bảo tệp đúng định dạng .xlsx, .xls hoặc .csv và thử lại.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Run validation whenever parsed rows or configuration states change
  useEffect(() => {
    if (parsedRows.length === 0) {
      setValidatedRows([]);
      return;
    }

    const validated = parsedRows.map((row) => {
      const errors: string[] = [];
      const isDuplicateInDb = citizens.some(c => c.id === row.id);
      
      if (!row.id) {
        errors.push('Thiếu số định danh (CCCD).');
      } else if (row.id.length !== 12 || !/^\d+$/.test(row.id)) {
        errors.push('Số CCCD phải gồm đúng 12 chữ số.');
      }

      if (!row.fullName) {
        errors.push('Họ tên không được để trống.');
      } else if (row.fullName.length < 2) {
        errors.push('Họ tên quá ngắn (tối thiểu 2 ký tự).');
      }

      if (!row.dob) {
        errors.push('Thiếu ngày sinh.');
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dob)) {
        errors.push('Ngày sinh không đúng định dạng YYYY-MM-DD.');
      }

      if (!row.householdId) {
        errors.push('Thiếu mã hộ khẩu.');
      } else {
        const householdExists = households.some(h => h.id === row.householdId);
        if (!householdExists) {
          errors.push(`Mã hộ khẩu "${row.householdId}" không tồn tại trên hệ thống.`);
        }
      }

      const duplicateInFile = parsedRows.filter(r => r.id === row.id).length > 1;
      if (duplicateInFile) {
        const firstOccur = parsedRows.find(r => r.id === row.id);
        if (firstOccur && firstOccur.rowNumber !== row.rowNumber) {
          errors.push('Số CCCD trùng với một dòng khác trong cùng tệp.');
        }
      }

      if (row.isHouseholder && row.householdId) {
        const otherHHInFile = parsedRows.some(
          r => r.householdId === row.householdId && r.isHouseholder && r.rowNumber !== row.rowNumber
        );
        if (otherHHInFile) {
          errors.push('Có nhiều hơn 1 người tự nhận là Chủ hộ của hộ này trong tệp tải lên.');
        } else {
          const sysHH = citizens.find(c => c.householdId === row.householdId && c.isHouseholder && c.id !== row.id);
          if (sysHH && !overwriteDuplicates) {
            errors.push(`Hộ này đã có chủ hộ là: ${sysHH.fullName}.`);
          }
        }
      }

      if (isDuplicateInDb && !overwriteDuplicates) {
        errors.push('Số CCCD đã tồn tại trong hệ thống (chọn "Cập nhật trùng" để ghi đè).');
      }

      return {
        rowNumber: row.rowNumber,
        data: {
          id: row.id,
          fullName: row.fullName,
          dob: row.dob,
          gender: row.gender,
          phone: row.phone,
          occupation: row.occupation,
          householdId: row.householdId,
          isHouseholder: row.isHouseholder,
          notes: row.notes
        },
        isValid: errors.length === 0,
        errors,
        isDuplicateInDb
      };
    });

    setValidatedRows(validated);
  }, [parsedRows, overwriteDuplicates, citizens, households]);

  const handleConfirmImport = () => {
    if (!onImportCitizens) return;
    const validCitizens = validatedRows
      .filter(r => r.isValid)
      .map(r => r.data as Citizen);

    if (validCitizens.length === 0) {
      setImportError('Không có dữ liệu hợp lệ nào để nhập.');
      return;
    }

    onImportCitizens(validCitizens);
    setIsImportOpen(false);
    resetImportState();
  };

  const resetImportState = () => {
    setImportFile(null);
    setParsedRows([]);
    setValidatedRows([]);
    setImportError('');
  };

  // Helper to trigger downloaded Excel template
  const downloadExcelTemplate = () => {
    const templateData = [
      {
        "Số CCCD (12 chữ số)": "037096001234",
        "Họ và Tên": "Nguyễn Văn A",
        "Ngày sinh (YYYY-MM-DD)": "1990-05-15",
        "Giới tính (Nam/Nữ/Khác)": "Nam",
        "Số điện thoại": "0987654321",
        "Nghề nghiệp": "Kỹ sư nông nghiệp",
        "Mã hộ khẩu": households[0]?.id || "HK001",
        "Là chủ hộ (Có/Không)": "Có",
        "Ghi chú đặc điểm": "Đoàn viên thanh niên, cán bộ nguồn"
      },
      {
        "Số CCCD (12 chữ số)": "037096005678",
        "Họ và Tên": "Trần Thị B",
        "Ngày sinh (YYYY-MM-DD)": "1995-10-20",
        "Giới tính (Nam/Nữ/Khác)": "Nữ",
        "Số điện thoại": "0912345678",
        "Nghề nghiệp": "Làm ruộng",
        "Mã hộ khẩu": households[0]?.id || "HK001",
        "Là chủ hộ (Có/Không)": "Không",
        "Ghi chú đặc điểm": "Hộ nghèo cần hỗ trợ giống lúa mới"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sach cong dan");
    
    worksheet['!cols'] = [
      { wch: 22 }, // CCCD
      { wch: 20 }, // Họ tên
      { wch: 22 }, // Ngày sinh
      { wch: 18 }, // Giới tính
      { wch: 15 }, // SĐT
      { wch: 20 }, // Nghề nghiệp
      { wch: 15 }, // Mã hộ khẩu
      { wch: 18 }, // Là chủ hộ
      { wch: 30 }  // Ghi chú
    ];

    XLSX.writeFile(workbook, "mau_nhap_lieu_cong_dan.xlsx");
  };

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState<Partial<Citizen>>({
    id: '',
    fullName: '',
    dob: '',
    gender: 'Nam',
    phone: '',
    occupation: '',
    householdId: '',
    isHouseholder: false,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      id: '',
      fullName: '',
      dob: '',
      gender: 'Nam',
      phone: '',
      occupation: '',
      householdId: households[0]?.id || '',
      isHouseholder: false,
      notes: ''
    });
    setFormError('');
  };

  const handleOpenAdd = () => {
    setFormMode('add');
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (citizen: Citizen) => {
    setFormMode('edit');
    setFormData(citizen);
    setFormError('');
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formData.id || formData.id.length !== 12 || !/^\d+$/.test(formData.id)) {
      setFormError('Số định danh cá nhân (CCCD) phải gồm chính xác 12 chữ số.');
      return false;
    }
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      setFormError('Họ tên phải có độ dài ít nhất 2 ký tự.');
      return false;
    }
    if (!formData.dob) {
      setFormError('Vui lòng chọn ngày sinh.');
      return false;
    }
    if (!formData.householdId) {
      setFormError('Vui lòng phân phối vào một hộ khẩu cụ thể.');
      return false;
    }
    
    // Check duplication of CCCD when adding
    if (formMode === 'add' && citizens.some(c => c.id === formData.id)) {
      setFormError('Số định danh cá nhân (CCCD) đã tồn tại trong hệ thống.');
      return false;
    }

    // Check if household already has a householder when designating this one as householder
    if (formData.isHouseholder) {
      const existingHouseholder = citizens.find(
        c => c.householdId === formData.householdId && c.isHouseholder && c.id !== formData.id
      );
      if (existingHouseholder) {
        setFormError(`Hộ này đã có chủ hộ là: ${existingHouseholder.fullName}. Chỉ có thể có 1 chủ hộ.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const citizenToSave = formData as Citizen;
    if (formMode === 'add') {
      onAddCitizen(citizenToSave);
    } else {
      onUpdateCitizen(citizenToSave);
    }
    setIsFormOpen(false);
    resetForm();
  };

  // Filter logic
  const filteredCitizens = citizens.filter((citizen) => {
    const matchesSearch = 
      (citizen.fullName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (citizen.id || '').includes(searchTerm || '') ||
      (citizen.phone || '').includes(searchTerm || '') ||
      (citizen.householdId || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      
    const matchesGender = selectedGender === 'All' || citizen.gender === selectedGender;
    const matchesHousehold = selectedHousehold === 'All' || citizen.householdId === selectedHousehold;
    
    return matchesSearch && matchesGender && matchesHousehold;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Quản Lý Công Dân</h1>
          <p className="text-slate-500 text-xs mt-1">
            Tra cứu, cập nhật thông tin hộ tịch, số định danh, giới tính và nghề nghiệp của cư dân trong xã.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              resetImportState();
              setIsImportOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 active:scale-[0.98] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
            title="Nhập danh sách công dân từ file Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập từ Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Khai báo Công Dân</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo Tên, Số CCCD, SĐT, Mã hộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
          />
        </div>

        {/* Gender Select */}
        <div className="w-full md:w-44">
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-xs transition-all"
          >
            <option value="All">Tất cả Giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        {/* Household Select */}
        <div className="w-full md:w-48">
          <select
            value={selectedHousehold}
            onChange={(e) => setSelectedHousehold(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-xs transition-all"
          >
            <option value="All">Tất cả Hộ khẩu</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>
                {h.id} - {h.householderName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-4 px-6">CCCD / Số Định Danh</th>
                <th className="py-4 px-6">Họ Và Tên</th>
                <th className="py-4 px-6">Ngày Sinh</th>
                <th className="py-4 px-6">Giới Tính</th>
                <th className="py-4 px-6">Số Điện Thoại</th>
                <th className="py-4 px-6">Nghề Nghiệp</th>
                <th className="py-4 px-6">Thuộc Hộ Hộ Khẩu</th>
                <th className="py-4 px-6">Chức Vụ</th>
                <th className="py-4 px-6 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCitizens.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không tìm thấy dữ liệu công dân phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCitizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-4 px-6 font-mono font-semibold text-slate-900">{citizen.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{citizen.fullName}</td>
                    <td className="py-4 px-6 font-mono">{citizen.dob}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        citizen.gender === 'Nam' ? 'bg-blue-50 text-blue-700' :
                        citizen.gender === 'Nữ' ? 'bg-pink-50 text-pink-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {citizen.gender}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono">{citizen.phone || <span className="text-slate-300">Chưa cập nhật</span>}</td>
                    <td className="py-4 px-6">{citizen.occupation || <span className="text-slate-400 italic">Không nghề</span>}</td>
                    <td className="py-4 px-6">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold font-mono">
                        {citizen.householdId}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {citizen.isHouseholder ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Chủ hộ
                        </span>
                      ) : (
                        <span className="text-slate-400">Thành viên</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(citizen)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-700 transition-all"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xác nhận xóa hồ sơ công dân: ${citizen.fullName}?`)) {
                              onDeleteCitizen(citizen.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600 transition-all"
                          title="Xóa hồ sơ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over or Popup Form for Add/Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wide">
                  {formMode === 'add' ? 'Khai báo Công Dân Mới' : 'Cập Nhật Hồ Sơ Công Dân'}
                </h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-0.5">Sổ hộ tịch Xã</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* CCCD (Unique ID) */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Số CCCD / Định Danh cá nhân (12 chữ số)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={formMode === 'edit'}
                    maxLength={12}
                    placeholder="Ví dụ: 037096012345"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all disabled:opacity-50"
                  />
                </div>

                {/* Full name */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Họ và Tên</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ và tên đầy đủ..."
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ngày Sinh</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Giới Tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-xs transition-all"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    placeholder="Không bắt buộc"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nghề Nghiệp</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Làm nông, Học sinh..."
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>

                {/* Household linking */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mã Hộ Khẩu</label>
                  <select
                    value={formData.householdId}
                    onChange={(e) => setFormData({ ...formData, householdId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-xs transition-all"
                  >
                    <option value="">Chọn hộ khẩu...</option>
                    {households.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.id} - Chủ hộ: {h.householderName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Is Householder checkbox */}
                <div className="flex items-center mt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isHouseholder}
                      onChange={(e) => setFormData({ ...formData, isHouseholder: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>Là Chủ Hộ</span>
                  </label>
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ghi Chú Đặc Điểm</label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Hoàn cảnh neo đơn, có công với cách mạng..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white rounded-xl text-xs transition-all"
                  />
                </div>
              </div>

              {/* Submit panel */}
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
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm uppercase tracking-wide">
                    Nhập dữ liệu Công Dân từ Excel
                  </h3>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-0.5">Hỗ trợ tệp định dạng .xlsx, .xls hoặc .csv</p>
                </div>
              </div>
              <button 
                onClick={() => setIsImportOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {importError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs border border-red-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold">Lỗi nhập tệp</p>
                    <p className="mt-0.5 font-medium">{importError}</p>
                  </div>
                </div>
              )}

              {!importFile ? (
                // STEP 1: Upload and guides
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Upload zone */}
                  <div className="md:col-span-2 space-y-4">
                    <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all min-h-[220px]">
                      <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Kéo thả tệp Excel của bạn vào đây</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">hoặc nhấp chuột để duyệt tìm tệp từ máy tính</p>
                      </div>
                      <span className="px-3 py-1.5 bg-white border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg shadow-2xs hover:shadow-xs mt-1 transition-all">
                        Chọn tệp dữ liệu
                      </span>
                    </label>

                    {/* Quick cheatsheet */}
                    <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                        <Info className="w-4 h-4 shrink-0" />
                        Lưu ý về cấu trúc tệp dữ liệu:
                      </h4>
                      <ul className="list-disc pl-4 text-[11px] text-amber-900/80 space-y-1">
                        <li>Dòng đầu tiên (Dòng 1) của file Excel phải là <strong>tiêu đề cột</strong>.</li>
                        <li>Trường <strong>Mã hộ khẩu</strong> phải chính xác và đã tồn tại trong Sổ hộ khẩu xã để liên kết dữ liệu.</li>
                        <li>Định dạng ngày sinh phải là <strong>YYYY-MM-DD</strong> (ví dụ: 1990-05-15) hoặc định dạng ngày chuẩn của Excel.</li>
                        <li>Trường <strong>Là chủ hộ</strong> nhận giá trị: Có / Không hoặc True / False.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Template and instructions */}
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800">Tệp mẫu nhập liệu chuẩn</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Để tránh các lỗi sai định dạng dữ liệu cột, vui lòng tải xuống mẫu bảng kê Excel chuẩn đã được thiết kế sẵn cấu trúc cột cho xã.
                      </p>
                      <button
                        onClick={downloadExcelTemplate}
                        className="w-full px-4 py-2.5 bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        Tải Tệp Excel Mẫu (.xlsx)
                      </button>
                    </div>

                    <div className="border-t border-slate-200/60 pt-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Danh sách Cột Mẫu</h4>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md">Số CCCD *</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md">Họ và Tên *</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md">Ngày sinh *</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold rounded-md">Giới tính</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold rounded-md">Số điện thoại</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold rounded-md">Nghề nghiệp</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md">Mã hộ khẩu *</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold rounded-md">Là chủ hộ</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold rounded-md">Ghi chú</span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-2 font-medium">* ký hiệu trường bắt buộc phải có</p>
                    </div>
                  </div>
                </div>
              ) : (
                // STEP 2: Preview and details
                <div className="space-y-4">
                  {/* File summary bar */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-inner">
                        XLS
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{importFile.name}</p>
                        <p className="text-[10px] text-slate-400">Dung lượng: {(importFile.size / 1024).toFixed(1)} KB • Số dòng phát hiện: {validatedRows.length}</p>
                      </div>
                    </div>
                    <button
                      onClick={resetImportState}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-[10px] rounded-lg transition-all"
                    >
                      Chọn tệp khác
                    </button>
                  </div>

                  {/* Summary Tally Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng số dòng</p>
                      <p className="text-lg font-bold text-slate-800 mt-1">{validatedRows.length}</p>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider">Hợp lệ để Nhập</p>
                      <p className="text-lg font-bold text-emerald-700 mt-1">
                        {validatedRows.filter(r => r.isValid).length}
                      </p>
                    </div>
                    <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-wider">Trùng CCCD hệ thống</p>
                      <p className="text-lg font-bold text-amber-700 mt-1">
                        {validatedRows.filter(r => r.isDuplicateInDb).length}
                      </p>
                    </div>
                    <div className="bg-red-50/60 border border-red-100 p-3 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-red-600/80 uppercase tracking-wider">Dòng bị Lỗi</p>
                      <p className="text-lg font-bold text-red-700 mt-1">
                        {validatedRows.filter(r => !r.isValid).length}
                      </p>
                    </div>
                  </div>

                  {/* Settings and filters toolbar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-2 border-b border-slate-100">
                    {/* Switch settings */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={overwriteDuplicates}
                          onChange={(e) => setOverwriteDuplicates(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="text-xs text-slate-700">Tự động cập nhật / Ghi đè hồ sơ nếu trùng số CCCD</span>
                      </label>
                    </div>

                    {/* Table Filters */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
                      <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${filterType === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Tất cả ({validatedRows.length})
                      </button>
                      <button
                        onClick={() => setFilterType('valid')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${filterType === 'valid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-emerald-600'}`}
                      >
                        Hợp lệ ({validatedRows.filter(r => r.isValid).length})
                      </button>
                      <button
                        onClick={() => setFilterType('invalid')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${filterType === 'invalid' ? 'bg-white text-red-700 shadow-2xs' : 'text-slate-500 hover:text-red-600'}`}
                      >
                        Lỗi ({validatedRows.filter(r => !r.isValid).length})
                      </button>
                    </div>
                  </div>

                  {/* Grid Table */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto max-h-[350px]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px] uppercase tracking-wider sticky top-0 z-10">
                            <th className="py-2.5 px-3 text-center">Dòng</th>
                            <th className="py-2.5 px-4">Trạng thái</th>
                            <th className="py-2.5 px-3">Số CCCD</th>
                            <th className="py-2.5 px-4">Họ và Tên</th>
                            <th className="py-2.5 px-3">Ngày sinh</th>
                            <th className="py-2.5 px-3">Giới tính</th>
                            <th className="py-2.5 px-3">SĐT</th>
                            <th className="py-2.5 px-3">Nghề nghiệp</th>
                            <th className="py-2.5 px-3">Mã hộ</th>
                            <th className="py-2.5 px-3">Chủ hộ</th>
                            <th className="py-2.5 px-4">Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {validatedRows
                            .filter(row => {
                              if (filterType === 'valid') return row.isValid;
                              if (filterType === 'invalid') return !row.isValid;
                              return true;
                            })
                            .map((row) => (
                              <tr 
                                key={row.rowNumber} 
                                className={`hover:bg-slate-50/50 ${!row.isValid ? 'bg-red-50/10' : ''}`}
                              >
                                <td className="py-2.5 px-3 text-center font-bold text-slate-400 text-[11px]">
                                  {row.rowNumber}
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  {row.isValid ? (
                                    row.isDuplicateInDb ? (
                                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold rounded-full">
                                        Cập nhật trùng
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold rounded-full">
                                        Mới hợp lệ
                                      </span>
                                    )
                                  ) : (
                                    <div className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-0.5 max-w-[180px] break-words">
                                      {row.errors.join(' ')}
                                    </div>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-800">
                                  {row.data.id || <span className="text-red-400">Trống</span>}
                                </td>
                                <td className="py-2.5 px-4 font-semibold text-slate-800 text-[11px]">
                                  {row.data.fullName || <span className="text-red-400">Trống</span>}
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600 whitespace-nowrap">
                                  {row.data.dob || <span className="text-red-400">Trống</span>}
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600">
                                  {row.data.gender}
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600 font-mono">
                                  {row.data.phone || '-'}
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600">
                                  {row.data.occupation || '-'}
                                </td>
                                <td className="py-2.5 px-3 text-[11px] font-bold text-slate-700">
                                  {row.data.householdId || <span className="text-red-400">Trống</span>}
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600 text-center">
                                  {row.data.isHouseholder ? (
                                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md uppercase">Chủ hộ</span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4 text-[10px] text-slate-500 italic max-w-[150px] truncate" title={row.data.notes}>
                                  {row.data.notes || '-'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-[0.98]"
              >
                Hủy bỏ
              </button>

              {importFile && (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={validatedRows.filter(r => r.isValid).length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 flex items-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận nhập {validatedRows.filter(r => r.isValid).length} Công Dân</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
