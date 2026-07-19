import { Citizen, Household, LandPlot, FarmingLog, LocalPlan, HandbookArticle, UserAccount, SystemLog } from '../types';

export const INITIAL_HOUSEHOLDS: Household[] = [
  {
    id: "HK001",
    householderName: "Nguyễn Văn Hùng",
    address: "Xóm 1, Thôn Bình Minh",
    memberCount: 4,
    phone: "0912345678",
    status: "Thường",
    landArea: 1500
  },
  {
    id: "HK002",
    householderName: "Trần Thị Mai",
    address: "Xóm 1, Thôn Bình Minh",
    memberCount: 3,
    phone: "0987654321",
    status: "Cận nghèo",
    landArea: 800
  },
  {
    id: "HK003",
    householderName: "Phạm Minh Đức",
    address: "Xóm 2, Thôn Hòa Bình",
    memberCount: 5,
    phone: "0905123456",
    status: "Thường",
    landArea: 3200
  },
  {
    id: "HK004",
    householderName: "Lê Thị Lan",
    address: "Xóm 3, Thôn Hạnh Phúc",
    memberCount: 2,
    phone: "0934888999",
    status: "Nghèo",
    landArea: 400
  },
  {
    id: "HK005",
    householderName: "Hoàng Anh Tuấn",
    address: "Xóm 2, Thôn Hòa Bình",
    memberCount: 4,
    phone: "0977111222",
    status: "Thường",
    landArea: 2500
  }
];

export const INITIAL_CITIZENS: Citizen[] = [
  {
    id: "037096012345",
    fullName: "Nguyễn Văn Hùng",
    dob: "1978-05-12",
    gender: "Nam",
    phone: "0912345678",
    occupation: "Làm nông",
    householdId: "HK001",
    isHouseholder: true,
    notes: "Chủ hộ gia đình, phụ trách chính sản xuất nông nghiệp."
  },
  {
    id: "037196023456",
    fullName: "Lê Thị Thu",
    dob: "1982-09-20",
    gender: "Nữ",
    phone: "0912345679",
    occupation: "Làm nông",
    householdId: "HK001",
    isHouseholder: false,
    notes: "Vợ ông Hùng."
  },
  {
    id: "037204012345",
    fullName: "Nguyễn Văn Hải",
    dob: "2004-11-05",
    gender: "Nam",
    phone: "0356123456",
    occupation: "Sinh viên",
    householdId: "HK001",
    isHouseholder: false,
    notes: "Con trai lớn."
  },
  {
    id: "037207012345",
    fullName: "Nguyễn Thị Ngọc",
    dob: "2007-03-15",
    gender: "Nữ",
    phone: "",
    occupation: "Học sinh",
    householdId: "HK001",
    isHouseholder: false,
    notes: "Con gái út."
  },
  {
    id: "037180012345",
    fullName: "Trần Thị Mai",
    dob: "1980-04-18",
    gender: "Nữ",
    phone: "0987654321",
    occupation: "Làm nông",
    householdId: "HK002",
    isHouseholder: true,
    notes: "Chủ hộ đơn thân nuôi con."
  },
  {
    id: "037206012345",
    fullName: "Trần Minh Quân",
    dob: "2006-08-30",
    gender: "Nam",
    phone: "0387654321",
    occupation: "Học sinh",
    householdId: "HK002",
    isHouseholder: false
  },
  {
    id: "037085012345",
    fullName: "Phạm Minh Đức",
    dob: "1985-01-25",
    gender: "Nam",
    phone: "0905123456",
    occupation: "Chăn nuôi gia súc",
    householdId: "HK003",
    isHouseholder: true
  },
  {
    id: "037187012345",
    fullName: "Phan Thị Hồng",
    dob: "1987-10-12",
    gender: "Nữ",
    phone: "0905123457",
    occupation: "Kinh doanh tự do",
    householdId: "HK003",
    isHouseholder: false
  },
  {
    id: "037165012345",
    fullName: "Lê Thị Lan",
    dob: "1965-02-14",
    gender: "Nữ",
    phone: "0934888999",
    occupation: "Hưu trí / Làm nông",
    householdId: "HK004",
    isHouseholder: true,
    notes: "Hộ nghèo, neo đơn."
  }
];

export const INITIAL_LAND_PLOTS: LandPlot[] = [
  {
    id: "LP001",
    householdId: "HK001",
    type: "Trồng lúa",
    area: 1000,
    location: "Cánh đồng Đồng Trong",
    currentCrop: "Lúa Thơm RVT"
  },
  {
    id: "LP002",
    householdId: "HK001",
    type: "Trồng cây ăn quả",
    area: 500,
    location: "Vườn nhà Thôn Bình Minh",
    currentCrop: "Bưởi Da Xanh"
  },
  {
    id: "LP003",
    householdId: "HK002",
    type: "Trồng lúa",
    area: 800,
    location: "Cánh đồng Đồng Trong",
    currentCrop: "Lúa Khang Dân"
  },
  {
    id: "LP004",
    householdId: "HK003",
    type: "Chăn nuôi",
    area: 2000,
    location: "Khu trang trại Hòa Bình",
    currentCrop: "Bò Lai Sind (12 con)"
  },
  {
    id: "LP005",
    householdId: "HK003",
    type: "Nuôi trồng thủy sản",
    area: 1200,
    location: "Ao Thôn Hòa Bình",
    currentCrop: "Cá Trắm, Cá Chép"
  },
  {
    id: "LP006",
    householdId: "HK005",
    type: "Trồng cây ăn quả",
    area: 2500,
    location: "Đồi Bãi Màu",
    currentCrop: "Cam Đường Canh"
  }
];

export const INITIAL_FARMING_LOGS: FarmingLog[] = [
  {
    id: "FL001",
    landPlotId: "LP001",
    activity: "Gieo sạ / Cấy lúa",
    date: "2026-06-01",
    notes: "Bắt đầu vụ lúa Hè Thu, gieo sạ giống RVT chất lượng cao."
  },
  {
    id: "FL002",
    landPlotId: "LP001",
    activity: "Bón phân đợt 1",
    date: "2026-06-15",
    notes: "Bón phân Urê và NPK thúc đẻ nhánh."
  },
  {
    id: "FL003",
    landPlotId: "LP002",
    activity: "Phun thuốc sinh học",
    date: "2026-07-10",
    notes: "Phun thuốc phòng trừ sâu vẽ bùa cho vườn bưởi da xanh."
  },
  {
    id: "FL004",
    landPlotId: "LP004",
    activity: "Tiêm vắc xin lở mồm long móng",
    date: "2026-07-05",
    notes: "Tiêm phòng định kỳ cho đàn bò 12 con."
  }
];

export const INITIAL_PLANS: LocalPlan[] = [
  {
    id: "PLAN001",
    title: "Chiến dịch tiêm phòng vắc xin cho gia súc, gia cầm vụ Thu Đông",
    objective: "Đạt tỷ lệ tiêm phòng trên 95% tổng đàn bò, lợn, gà toàn xã nhằm ngăn ngừa dịch tả lợn châu Phi và LMLM.",
    startDate: "2026-08-01",
    endDate: "2026-08-15",
    assignee: "Phạm Minh Đức (Phó ban Thú y)",
    status: "Chưa bắt đầu"
  },
  {
    id: "PLAN002",
    title: "Nâng cấp kênh mương nội đồng Cánh đồng Đồng Trong",
    objective: "Kiên cố hóa 1.2km kênh mương đất để phục vụ tưới tiêu chủ động cho 40ha lúa vụ Mùa.",
    startDate: "2026-07-01",
    endDate: "2026-07-30",
    assignee: "Nguyễn Văn Hùng (Trưởng thôn Bình Minh)",
    status: "Đang thực hiện"
  },
  {
    id: "PLAN003",
    title: "Tổ chức lớp tập huấn kỹ thuật thâm canh Bưởi Da Xanh",
    objective: "Tập huấn cho 50 hộ trồng bưởi về quy trình hữu cơ và chứng nhận VietGAP.",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    assignee: "Trạm Khuyến nông Huyện",
    status: "Đã hoàn thành"
  }
];

export const INITIAL_HANDBOOK: HandbookArticle[] = [
  {
    id: "HB001",
    title: "Kỹ thuật canh tác lúa hữu cơ năng suất cao",
    category: "Trồng trọt",
    content: `Quy trình canh tác lúa nước hữu cơ giúp nâng cao chất lượng gạo và bảo vệ môi trường:
1. Chuẩn bị đất: Cày ải phơi ruộng trước 15-20 ngày, bón lót phân chuồng ủ hoai hoặc phân hữu cơ vi sinh khoảng 500kg/sào.
2. Chọn giống: Sử dụng giống lúa thuần chủng, có khả năng kháng bệnh tốt (RVT, ST25). Gieo mạ dày vừa phải.
3. Chăm sóc: Điều tiết nước hợp lý: để nước sâu 3-5cm lúc đẻ nhánh rộ, phơi ruộng nứt chân chim trước khi làm đòng.
4. Quản lý sâu bệnh: Sử dụng chế phẩm nấm xanh, nấm trắng tiêu diệt sâu cuốn lá, rầy nâu. Không phun thuốc hóa học độc hại.`,
    author: "ThS. Nguyễn Thị Huệ (Trạm Khuyến nông)",
    date: "2026-05-10"
  },
  {
    id: "HB002",
    title: "Phòng ngừa dịch bệnh tai xanh ở lợn trong mùa mưa lũ",
    category: "Chăn nuôi",
    content: `Bệnh tai xanh (PRRS) là bệnh truyền nhiễm nguy hiểm. Để chủ động phòng tránh:
1. Vệ sinh tiêu độc khử trùng: Thường xuyên phun thuốc sát trùng chuồng nuôi bằng vôi bột hoặc dung dịch Han-Iodine 10%.
2. Tiêm phòng vắc-xin đầy đủ: Tiêm phòng vắc-xin tai xanh định kỳ cho lợn nái và lợn thịt đúng thời điểm.
3. Chăm sóc nuôi dưỡng: Tăng sức đề kháng bằng cách bổ sung Vitamin C, chất điện giải và men tiêu hóa vào thức ăn, nước uống.
4. Phát hiện sớm: Khi thấy lợn sốt cao, thở khó, tai tím tái cần cách ly ngay và báo cho cán bộ thú y xã.`,
    author: "BS. Thú y Lê Văn Cường",
    date: "2026-06-18"
  },
  {
    id: "HB003",
    title: "Chính sách hỗ trợ vốn vay phục hồi sản xuất nông nghiệp sau thiên tai",
    category: "Chính sách",
    content: `Theo Nghị định số 02/2017/NĐ-CP của Chính phủ quy định về cơ chế, chính sách hỗ trợ sản xuất nông nghiệp để khôi phục sản xuất vùng bị thiệt hại do thiên tai, dịch bệnh:
- Hỗ trợ đối với cây trồng:
  + Diện tích lúa bị thiệt hại trên 70%: hỗ trợ 2.000.000 đồng/ha.
  + Diện tích rau màu bị thiệt hại trên 70%: hỗ trợ 2.000.000 đồng/ha.
  + Cây ăn quả bị thiệt hại trên 70%: hỗ trợ 4.000.000 đồng/ha.
- Hỗ trợ chăn nuôi: hỗ trợ gia súc, gia cầm bị chết do dịch bệnh hoặc thiên tai theo quy định cụ thể.
Hồ sơ đăng ký nộp tại UBND Xã để tổng hợp, thẩm định và giải ngân hỗ trợ kịp thời.`,
    author: "Ủy ban Nhân dân Xã",
    date: "2026-04-02"
  }
];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    username: "admin",
    fullName: "Nguyễn Minh Triết",
    role: "Cán bộ chính quy",
    phone: "0912.345.678",
    password: "123456@",
    createdAt: "2026-01-10"
  },
  {
    username: "canbo_nongnghiep",
    fullName: "Phạm Hoàng Sơn",
    role: "Cán bộ nông nghiệp",
    phone: "0987.654.321",
    password: "123456",
    createdAt: "2026-02-15"
  },
  {
    username: "congtacvien_thuan",
    fullName: "Lê Thị Thuần",
    role: "Cộng tác viên",
    phone: "0356.111.222",
    password: "123456",
    createdAt: "2026-03-01"
  }
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: "LOG001",
    timestamp: "2026-07-18 08:30:12",
    username: "canbo_chinhquy",
    action: "Đăng nhập",
    details: "Cán bộ Nguyễn Minh Triết đăng nhập hệ thống thành công từ địa chỉ IP đồng bộ."
  },
  {
    id: "LOG002",
    timestamp: "2026-07-18 09:15:45",
    username: "canbo_nongnghiep",
    action: "Thêm nhật ký",
    details: "Ghi nhận hoạt động gieo sạ lúa ST25 trên thửa đất LP001 cánh đồng Đồng Trong."
  },
  {
    id: "LOG003",
    timestamp: "2026-07-18 10:02:11",
    username: "canbo_chinhquy",
    action: "Cập nhật công dân",
    details: "Cập nhật thông tin CCCD của cư dân Nguyễn Văn Hùng tại Hộ HK001."
  }
];

