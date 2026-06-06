# TronX AI Dashboard

Phần mềm quản lý bán hàng đa kênh thông minh — AI Dashboard & Chatbot.

## Cách chạy

```bash
# Cài đặt dependency
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Chạy production server
npm start

# Kiểm tra lint
npm run lint
```

Mở [http://localhost:3000](http://localhost:3000) — tự động redirect đến `/login`.

## Stack công nghệ

- **Framework**: Next.js 16.2.7 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Font**: Geist Sans (Google Fonts)

## Trạng thái scope — Giai đoạn 1

### Frontend UI

> **Lưu ý**: Tất cả các trang dưới đây chỉ là **UI mock** với dữ liệu giả (mock data).
> Chưa có backend, chưa có logic xử lý thực. Buttons, filters, tabs chỉ có UI, chưa có functionality.
> Dark mode chưa được triển khai.

| Khu vực | Trạng thái | Chi tiết |
|---------|-----------|----------|
| **Auth - Login** | ✅ UI mock completed | Form layout, social login icons. Hero panel chờ asset từ designer |
| **Auth - Quên mật khẩu** | ✅ UI mock completed | Email input form |
| **Auth - Nhập mã OTP** | ✅ UI mock completed | 5 ô OTP, countdown UI |
| **Auth - Đặt lại mật khẩu** | ✅ UI mock completed | New/confirm password form |
| **Dashboard Shell** | ✅ UI mock completed | Sidebar nav, topbar, chatbot button |
| **Dashboard Overview** | ✅ UI mock completed | 5 KPI cards, line chart, donut chart, top products/campaigns tables |
| **Import dữ liệu** | ✅ UI mock completed | Source selection, upload zone, hướng dẫn, lịch sử import |
| **Quản lý dữ liệu** | ✅ UI mock completed | Filter tabs, summary cards, data table, detail panel |
| **Báo cáo doanh thu** | ✅ UI mock completed | KPI cards, line chart, donut, detail table |
| **Báo cáo lợi nhuận** | ✅ UI mock completed | KPI cards, charts, profit table |
| **BC sản phẩm** | 🔲 Placeholder | Route tồn tại, chờ thiết kế chi tiết |
| **BC campaign** | 🔲 Placeholder | Route tồn tại, chờ thiết kế chi tiết |
| **BC theo nền tảng** | 🔲 Placeholder | Route tồn tại, chờ thiết kế chi tiết |
| **Cài đặt công thức / KPI** | 🔲 Placeholder | Route tồn tại, chờ thiết kế chi tiết |
| **Quản lý shop / nền tảng** | 🔲 Placeholder | Route tồn tại, chờ thiết kế chi tiết |
| **Cài đặt hệ thống** | 🔲 Placeholder | Route tồn tại, chờ thiết kế chi tiết |
| **Dark mode** | ❌ Chưa triển khai | Chưa có design token cho dark mode |

### 6 routes placeholder

Các route sau tồn tại nhưng chỉ hiển thị text placeholder, chưa có UI thực:

1. `/dashboard/reports/products` — BC sản phẩm
2. `/dashboard/reports/campaigns` — BC campaign
3. `/dashboard/reports/platforms` — BC theo nền tảng
4. `/dashboard/settings/kpi` — Cài đặt công thức / KPI
5. `/dashboard/settings/shops` — Quản lý shop / nền tảng
6. `/dashboard/settings/system` — Cài đặt hệ thống

### 🔲 Chưa triển khai (Backend + Tích hợp)

- [ ] Authentication backend (đăng nhập/đăng ký/OTP thật)
- [ ] Import Excel/CSV parser (Shopee, TikTok Shop, Ads, Giá vốn)
- [ ] Chuẩn hóa dữ liệu & lưu database
- [ ] API Dashboard KPI tính toán thực từ dữ liệu import
- [ ] AI Chatbot tiếng Việt (tích hợp LLM, trả lời theo dữ liệu)
- [ ] Tích hợp website hiện có hoặc triển khai subdomain
- [ ] User management & role-based access

## Cấu trúc dự án

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, forgot-password, verify-code, reset-password)
│   ├── dashboard/       # Dashboard pages
│   │   ├── import/      # Import dữ liệu
│   │   ├── data-management/  # Quản lý dữ liệu
│   │   ├── reports/     # Báo cáo (revenue, profit, products, campaigns, platforms)
│   │   └── settings/    # Cài đặt (kpi, shops, system)
│   ├── globals.css
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Redirect → /login
├── components/
│   ├── layout/          # Sidebar, Topbar, ChatbotButton
│   └── ui/              # MetricCard, ChartCard, DataTable, FilterPanel
└── lib/
    ├── types.ts         # TypeScript interfaces
    ├── mock-data.ts     # Dữ liệu mock (Vietnamese)
    └── utils.ts         # Utilities (cn, formatCurrency, formatNumber)
```

## Đầu vào còn thiếu từ designer/khách

### Cần từ Designer:
1. **Asset hero login panel** — ảnh/SVG không chứa text overlay (để code responsive)
2. **Thiết kế chi tiết** cho 6 màn hình đang placeholder:
   - Báo cáo sản phẩm
   - Báo cáo campaign
   - Báo cáo theo nền tảng
   - Cài đặt công thức / KPI
   - Quản lý shop / nền tảng
   - Cài đặt hệ thống
3. **File Figma editable** hoặc dev mode/spec/design tokens
4. **Font chính xác** nếu designer dùng font khác system font

### Cần từ Khách hàng:
1. **Dữ liệu mẫu thật** — file export Shopee, TikTok Shop, Ads, Giá vốn (Excel/CSV)
2. **Template/công thức KPI đã chốt**: doanh thu, phí sàn, hoàn/hủy, giá vốn, ads, gross profit, net profit, ROAS, CPA, margin
3. **API key/provider AI** cho chatbot (OpenAI, Gemini, etc.)
4. **Yêu cầu triển khai**: auth provider, server, domain/subdomain
5. **Responsive requirements**: mobile/tablet nếu cần
