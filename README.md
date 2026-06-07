# TronX AI Dashboard

Phần mềm quản lý bán hàng đa kênh cho Nền Tảng Online: nhập dữ liệu bán hàng, chuẩn hóa KPI, xem báo cáo và hỏi nhanh bằng chatbot theo dữ liệu đang có trong hệ thống.

## Cách chạy

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Ứng dụng sẽ chuyển về màn đăng nhập nếu chưa có phiên làm việc.

## Build production

```bash
npm run lint
npm run build
npm start
```

## Tài khoản quản trị mặc định

| Trường | Giá trị |
| --- | --- |
| Email | `admin@tronx.vn` hoặc `admin` |
| Password | `admin123` |
| Env override | `TRONX_ADMIN_EMAIL`, `TRONX_ADMIN_PASSWORD` |

## Trạng thái Phase 1

Các hạng mục Phase 1 đã được triển khai để bàn giao vận hành:

| Hạng mục | Trạng thái |
| --- | --- |
| Đăng nhập quản trị | Đã có login/logout bằng session cookie httpOnly |
| Hồ sơ tài khoản | Đã có cập nhật tên/email/avatar và đổi mật khẩu |
| Import dữ liệu | Đã nhận `.csv/.xlsx`, kiểm tra file, parse và chuẩn hóa theo nguồn |
| Template import | Đã có template cho Shopee, TikTok Shop, Ads, Giá vốn, Lazada |
| Dashboard KPI | Đã tính từ dữ liệu đã import hoặc dữ liệu hệ thống khi chưa có import mới |
| Báo cáo doanh thu | Đã có KPI, chart, cơ cấu kênh và bảng chi tiết |
| Báo cáo lợi nhuận | Đã có KPI, chart chi phí/kênh và bảng chi tiết |
| Báo cáo sản phẩm | Đã có KPI, tìm kiếm và bảng sản phẩm |
| Báo cáo campaign | Đã có KPI, tìm kiếm và bảng campaign |
| Báo cáo nền tảng | Đã có thống kê doanh thu theo kênh |
| Quản lý dữ liệu | Đã có lịch sử import, tìm kiếm/lọc, xem chi tiết, tải CSV và xóa import |
| Chatbot dữ liệu | Đã trả lời theo analytics/import hiện tại |
| Cài đặt | Đã có màn quản lý shop/nền tảng, công thức KPI và thông tin hệ thống |

## API chính

| API | Chức năng |
| --- | --- |
| `POST /api/auth/login` | Đăng nhập quản trị |
| `POST /api/auth/logout` | Đăng xuất |
| `GET /api/auth/me` | Lấy thông tin phiên hiện tại |
| `PATCH /api/auth/me` | Cập nhật hồ sơ |
| `POST /api/auth/password` | Đổi mật khẩu |
| `GET /api/analytics` | Lấy KPI, chart và dữ liệu báo cáo |
| `GET /api/imports` | Lấy lịch sử import, chi tiết hoặc tải CSV |
| `POST /api/imports` | Import file dữ liệu |
| `DELETE /api/imports` | Xóa một lượt import |
| `POST /api/chat` | Hỏi chatbot theo dữ liệu hệ thống |

## Dữ liệu runtime

Mặc định dữ liệu runtime được lưu trong `.runtime-data`. Khi triển khai production, cấu hình `TRONX_DATA_DIR` trỏ tới thư mục lưu trữ bền vững của môi trường chạy.

## Cần đối chiếu với khách trước khi chốt bàn giao

1. Nhận file export thật từ từng nguồn để khóa mapping header thực tế.
2. Import thử từng file thật và kiểm tra lại KPI doanh thu, phí sàn, giá vốn, ads, gross profit, net profit, ROAS, CPA, margin.
3. Cấu hình domain, biến môi trường, thư mục lưu dữ liệu production và tài khoản quản trị chính thức.
4. Nếu muốn chatbot dùng model bên thứ ba, cấu hình provider/key theo tài khoản của khách.

Các kết nối realtime/API trực tiếp tới sàn, đồng bộ token shop và tự động kéo dữ liệu nằm ngoài Phase 1.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Lucide React
- CSV/XLSX import pipeline nội bộ

## Cấu trúc chính

```text
src/
  app/
    (auth)/login/
    api/
    dashboard/
      data-management/
      import/
      reports/
      settings/
  components/
    layout/
    ui/
  hooks/
  lib/
    server/
```
