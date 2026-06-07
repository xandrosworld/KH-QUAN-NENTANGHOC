# Pending Items — Cần khách hàng xác nhận

> Last updated: 2026-06-07

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
- Nếu đang có file `.xls` legacy, xuất lại sang `.xlsx` hoặc `.csv` trước khi gửi
- Quy tắc xử lý khi import file trùng kỳ (overwrite? merge? reject?)

## 2. Công thức KPI chính thức

Đã có công thức khách bổ sung và đã đưa vào engine Phase 1:

| KPI | Công thức | Status |
|-----|-----------|--------|
| Doanh thu | Tổng giá trị đơn thành công | ✅ Đang áp dụng |
| Phí sàn | Shopee/TikTok thu | ✅ Đang áp dụng |
| Hoàn/Hủy | Tổng đơn hoàn + hủy | ✅ Đang áp dụng |
| Giá vốn | Số lượng bán × giá vốn | ✅ Đang áp dụng |
| Ads | Tổng chi phí quảng cáo | ✅ Đang áp dụng |
| Gross Profit | Doanh thu - Giá vốn | ✅ Đang áp dụng |
| Net Profit | Doanh thu - Giá vốn - Ads - Phí sàn - Hoàn/Hủy | ✅ Đang áp dụng |
| Margin | Net Profit / Doanh thu × 100 | ✅ Đang áp dụng |
| ROAS | Doanh thu / Chi phí Ads | ✅ Đang áp dụng |
| CPA | Chi phí Ads / Số đơn | ✅ Đang áp dụng |

## 3. Màn hình

Các màn dashboard/import/data-management/reports/settings chính đã có UI chạy được. Không còn trang báo cáo/cài đặt chính hiển thị "Đang phát triển".

## 4. Known Gaps (UI)

Các điểm lệch nhỏ giữa Figma và runtime đã ghi nhận (xem `docs/QA_STATUS.md`):

- Hero login: chờ designer tách text khỏi illustration ✅ **Đã fix** — dùng asset mới no-text + HTML overlay
- KPI card colored bg tint: cosmetic, low priority
- Revenue filter sidebar panel: Phase 2
- Profit formula bar: Phase 2

## 5. Technical debt

- Recharts SSG warnings (7): Runtime OK, chỉ là console warning khi SSG. Xem chi tiết trong `docs/QA_STATUS.md`.
