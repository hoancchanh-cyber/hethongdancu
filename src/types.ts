export interface Citizen {
  id: string; // CCCD / ID
  fullName: string;
  dob: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  phone: string;
  occupation: string;
  householdId: string; // Reference to Household
  isHouseholder: boolean;
  notes?: string;
}

export interface Household {
  id: string; // Mã hộ khẩu
  householderName: string;
  address: string;
  memberCount: number;
  phone: string;
  status: 'Thường' | 'Cận nghèo' | 'Nghèo';
  landArea: number; // Diện tích đất nông nghiệp sở hữu (m2)
}

export interface LandPlot {
  id: string;
  householdId: string;
  type: 'Trồng lúa' | 'Trồng cây ăn quả' | 'Nuôi trồng thủy sản' | 'Chăn nuôi';
  area: number; // m2
  location: string;
  currentCrop: string; // Lúa nước, Cam, Bưởi, Tôm, Cá, Bò, Heo...
}

export interface FarmingLog {
  id: string;
  landPlotId: string;
  activity: string; // Gieo sạ, Bón phân, Phun thuốc, Thu hoạch...
  date: string;
  notes: string;
}

export interface LocalPlan {
  id: string;
  title: string;
  objective: string;
  startDate: string;
  endDate: string;
  assignee: string;
  status: 'Chưa bắt đầu' | 'Đang thực hiện' | 'Đã hoàn thành';
}

export interface HandbookArticle {
  id: string;
  title: string;
  category: 'Trồng trọt' | 'Chăn nuôi' | 'Chính sách' | 'Khác';
  content: string;
  author: string;
  date: string;
}

export interface UserAccount {
  username: string;
  fullName: string;
  role: 'Cán bộ chính quy' | 'Cán bộ nông nghiệp' | 'Cộng tác viên' | 'Quản trị viên' | 'Trưởng thôn' | 'Cán bộ Thú y / Thủy lợi' | 'Cán bộ Tư pháp - Hộ tịch';
  phone?: string;
  password?: string;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  details: string;
}

