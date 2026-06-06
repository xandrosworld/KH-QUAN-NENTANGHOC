# Pending Items — Cần khách hàng xác nhận

> Last updated: 2026-06-06

## 1. File mẫu import

Cần khách gửi file mẫu thực tế (Excel/CSV) cho từng nguồn dữ liệu để xây dựng column mapping và parser.

| Nguồn | File mẫu | Status |
|-------|----------|--------|
| Shopee | File export đơn hàng Shopee (.xlsx/.csv) | ❌ Chưa có |
| TikTok Shop | File export đơn hàng TikTok Shop (.xlsx/.csv) | ❌ Chưa có |
| Ads (Facebook/TikTok/Google) | File chi phí quảng cáo (.xlsx/.csv) | ❌ Chưa có |
| Giá vốn | File bảng giá vốn sản phẩm (.xlsx/.csv) | ❌ Chưa có |

**Cần xác nhận thêm:**
- Mỗi file mẫu cần có header row + ít nhất 5-10 dòng dữ liệu thật
- Xác nhận encoding (UTF-8?)
- Nếu có nhiều sheet, chỉ rõ sheet nào cần import
- Quy tắc xử lý khi import file trùng kỳ (overwrite? merge? reject?)

## 2. Công thức KPI chính thức

Figma hiển thị: `Giá Profit = Doanh thu - Giá vốn - Chi phí Ads - Phí sàn - Vận chuyển - Phí khác`

Cần khách xác nhận chi tiết:

| KPI | Câu hỏi | Status |
|-----|---------|--------|
| **Doanh thu** | Doanh thu gộp hay đã trừ hoàn? Tính trước hay sau VAT? | ❌ Chờ xác nhận |
| **Giá vốn (COGS)** | Tính theo giá vốn trung bình hay FIFO? Có gồm chi phí kho? | ❌ Chờ xác nhận |
| **Chi phí Ads** | Gộp tất cả nền tảng (FB + TikTok + Google) hay tách riêng? | ❌ Chờ xác nhận |
| **Phí sàn** | Bao gồm phí giao dịch + phí payment gateway? | ❌ Chờ xác nhận |
| **Vận chuyển** | Phí ship do shop trả hay bao gồm cả phần khách trả? | ❌ Chờ xác nhận |
| **Phí khác** | Cụ thể gồm những khoản nào? | ❌ Chờ xác nhận |
| **Lợi nhuận gộp** | = Doanh thu - Giá vốn? Hay trừ thêm phí sàn? | ❌ Chờ xác nhận |
| **Net Profit** | = Doanh thu - tất cả chi phí? Xác nhận công thức cuối | ❌ Chờ xác nhận |
| **ROAS** | = Doanh thu / Chi phí Ads? Theo từng kênh hay tổng? | ❌ Chờ xác nhận |
| **AOV** | = Doanh thu / Số đơn hàng? Tính đơn hoàn không? | ❌ Chờ xác nhận |
| **Tỷ lệ hoàn** | = Đơn hoàn / Tổng đơn? Theo số lượng hay giá trị? | ❌ Chờ xác nhận |
| **Biên LN gộp** | = Lợi nhuận gộp / Doanh thu × 100%? | ❌ Chờ xác nhận |
| **Biên LN ròng** | = Net Profit / Doanh thu × 100%? | ❌ Chờ xác nhận |

## 3. Màn hình còn placeholder

Các màn sau có Figma PNG reference nhưng chưa được implement chi tiết (hiện hiển thị "Đang phát triển"):

| Màn hình | Figma file | Ưu tiên |
|----------|-----------|---------|
| Báo cáo sản phẩm | BC_SanPham.png | Cao |
| Báo cáo campaign | BC_Campaign.png | Cao |
| Báo cáo theo nền tảng | BC_NenTang.png | Trung bình |
| Quản lý dữ liệu | Dashboard_QuanLyDuLieu.png | Trung bình |
| Cài đặt công thức/KPI | CaiDat_CongThuc.png | Trung bình |
| Quản lý shop/nền tảng | QuanLy_Shop.png | Trung bình |
| Cài đặt hệ thống | CaiDat_HeThong.png | Thấp |
| Quên mật khẩu | QuenMK.png | Thấp |
| Xác nhận mã | MaQuenMK.png | Thấp |
| Đặt lại mật khẩu | DatLaiMK.png | Thấp |

## 4. Known Gaps (UI)

Các điểm lệch nhỏ giữa Figma và runtime đã ghi nhận (xem `docs/QA_STATUS.md`):

- Hero login: chờ designer tách text khỏi illustration ✅ **Đã fix** — dùng asset mới no-text + HTML overlay
- KPI card colored bg tint: cosmetic, low priority
- Revenue filter sidebar panel: Phase 2
- Profit formula bar: Phase 2

## 5. Technical debt

- Recharts SSG warnings (7): Runtime OK, chỉ là console warning khi SSG. Xem chi tiết trong `docs/QA_STATUS.md`.
