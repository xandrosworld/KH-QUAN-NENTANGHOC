# KPI Formulas

Last updated: 2026-06-06

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

## Assessment

Đủ để làm UI mock, màn cài đặt công thức/KPI và constants tính toán nội bộ.

Chưa đủ để tính production từ file import cho đến khi có file mẫu và column mapping cho Shopee, TikTok Shop, Ads và Giá vốn.

## Still Needed

| Item | Why |
| --- | --- |
| File mẫu Shopee/TikTok Shop | Map cột doanh thu, trạng thái đơn thành công, hoàn/hủy, phí sàn |
| File mẫu Ads | Map cột chi phí quảng cáo theo nền tảng/campaign/ngày |
| File mẫu Giá vốn | Map SKU, số lượng bán, giá vốn và thời điểm áp dụng |
| Quy tắc số đơn cho CPA | CPA dùng số đơn thành công hay tổng đơn |
| Quy tắc chia cho 0 | Margin/ROAS/CPA khi mẫu số bằng 0 |
| Quy tắc hoàn/hủy | Tính theo số đơn hay giá trị tiền hoàn/hủy |
