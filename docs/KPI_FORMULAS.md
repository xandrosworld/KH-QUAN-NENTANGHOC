# KPI Formulas

Last updated: 2026-06-07

## Received From Client

| KPI | Formula |
| --- | --- |
| Doanh thu | Tổng giá trị đơn thành công |
| Phí sàn | Shopee/TikTok thu |
| Hoàn/Hủy | Tổng đơn hoàn + hủy |
| Giá vốn | Số lượng bán x giá vốn |
| Ads | Tổng chi phí quảng cáo |
| Gross Profit | Doanh thu - Giá vốn |
| Net Profit | Doanh thu - Giá vốn - Ads - Phí sàn - Hoàn/Hủy |
| Margin | Net Profit / Doanh thu x 100 |
| ROAS | Doanh thu / Chi phí Ads |
| CPA | Chi phí Ads / Số đơn |

## Implementation Status

Đã đủ và đã được đưa vào engine tính toán Phase 1.

Hiện hệ thống đã có:

- `POST /api/imports`: nhận `.xlsx/.csv`, parse và normalize dữ liệu.
- `GET /api/analytics`: tính KPI/dashboard/report từ dữ liệu đã import hoặc seed fallback.
- `POST /api/chat`: trả lời theo analytics hiện tại.
- Màn `Cài đặt công thức / KPI`: hiển thị bộ công thức đang áp dụng.

Khi khách gửi file mẫu, phần còn lại là khóa mapping header thực tế theo từng nguồn.

## Still Needed

| Item | Why |
| --- | --- |
| File mẫu Shopee/TikTok Shop | Map cột doanh thu, trạng thái đơn thành công, hoàn/hủy, phí sàn |
| File mẫu Ads | Map cột chi phí quảng cáo theo nền tảng/campaign/ngày |
| File mẫu Giá vốn | Map SKU, số lượng bán, giá vốn và thời điểm áp dụng |
| Header thực tế từng nguồn | Khóa mapping chính xác theo file export thật |
| Nếu có file `.xls` legacy | Xuất lại thành `.xlsx` hoặc `.csv` |
