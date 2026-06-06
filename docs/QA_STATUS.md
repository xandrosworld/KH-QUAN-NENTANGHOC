# QA Status — TronX AI Dashboard

> Last updated: 2026-06-06 (QA Round 3 acceptance)

## Accepted UI Screens

| Route | Screen | Status | Notes |
|-------|--------|--------|-------|
| `/login` | Login | ✅ Accepted | Hero đã chuyển sang asset no-text + HTML overlay |
| `/dashboard` | Dashboard chính | ✅ Accepted | KPI cards, line chart, donut chart, 2 tables |
| `/dashboard/import` | Import dữ liệu | ✅ Accepted | Stepper, source select, upload, file validation |
| `/dashboard/reports/revenue` | Báo cáo doanh thu | ✅ Accepted | KPIs, charts, detail table |
| `/dashboard/reports/profit` | Báo cáo lợi nhuận | ✅ Accepted | KPIs, 3 charts, detail table |

## Known Gaps (vs Figma)

| Screen | Gap | Severity | Action |
|--------|-----|----------|--------|
| Login | Hero panel dùng ảnh gốc, text bị nhúng trong ảnh | Low | Chờ designer xuất asset hero không chứa text |
| Dashboard | KPI card chưa có subtle colored background tint | Low | Giữ white bg, có thể tuning sau |
| Dashboard | Donut chart legend nằm bên phải (Figma nằm table format) | Low | Layout gần đúng, chi tiết tuning sau |
| Revenue | KPI titles/values hơi khác Figma (Figma có AOV, Sản phẩm đã bán) | Medium | Mock data hiện dùng tên khác, cần align với khách |
| Revenue | Chưa có "Bộ lọc báo cáo" sidebar panel như Figma | Medium | Phase 2 scope |
| Profit | KPI cards có 6 cards (Figma), hiện có 6 cards nhưng data khác | Medium | Cần khách xác nhận KPI definitions |
| Import | Mock history data khác Figma (tên file, ngày tháng) | Low | Data sẽ thay bằng real data khi có backend |

## Placeholder Screens (chưa có design chi tiết)

| Route | Screen | Status |
|-------|--------|--------|
| `/dashboard/data-management` | Quản lý dữ liệu | Placeholder — basic table mock |
| `/dashboard/reports/products` | Báo cáo sản phẩm | Placeholder — "Đang phát triển" |
| `/dashboard/reports/campaigns` | Báo cáo campaign | Placeholder — "Đang phát triển" |
| `/dashboard/reports/platforms` | Báo cáo theo nền tảng | Placeholder — "Đang phát triển" |
| `/dashboard/settings/kpi` | Cài đặt công thức/KPI | Placeholder — "Đang phát triển" |
| `/dashboard/settings/shops` | Quản lý shop/nền tảng | Placeholder — "Đang phát triển" |
| `/dashboard/settings/system` | Cài đặt hệ thống | Placeholder — "Đang phát triển" |
| `/forgot-password` | Quên mật khẩu | Placeholder — basic form |
| `/verify-code` | Xác nhận mã | Placeholder — basic form |
| `/reset-password` | Đặt lại mật khẩu | Placeholder — basic form |

Figma có export PNG cho: BC_Campaign, BC_NenTang, BC_SanPham, CaiDat_CongThuc, CaiDat_HeThong, Dashboard_QuanLyDuLieu, QuanLy_Shop, QuenMK, MaQuenMK, DatLaiMK. Sẽ implement khi chuyển sang phase tương ứng.

## Technical Debt

### Recharts SSG Warnings

- **Issue**: `width(-1) height(-1)` warnings xuất hiện 7 lần trong `npm run build`
- **Root cause**: Recharts `ResponsiveContainer` cần DOM để đo kích thước. SSG prerender không có DOM.
- **Runtime impact**: ❌ Không ảnh hưởng. Charts render hoàn toàn bình thường sau hydration.
- **Fix options**:
  1. Chuyển dashboard pages sang `export const dynamic = 'force-dynamic'` — loại bỏ SSG warnings nhưng mất static optimization
  2. Wrap charts trong `dynamic(() => import(...), { ssr: false })` — best practice, scope Phase 2
- **Decision**: Để nguyên, ghi nhận là technical debt. Không ảnh hưởng user experience.

### Hero Login Asset

- **Issue**: Ảnh bìa (auth-hero.png) chứa text nhúng. Khi scale/crop, text bị vỡ.
- **Action**: Chờ designer xuất asset hero **không chứa text** (chỉ illustration).
- **Workaround**: Dùng nguyên ảnh gốc, không crop/stretch.

## Pending Client Confirmation

### KPI Formulas
Các công thức tính KPI cần khách xác nhận:

| KPI | Pending |
|-----|---------|
| Lợi nhuận gộp | Công thức: Doanh thu - Giá vốn - ? |
| Net Profit | Trừ những khoản nào? Giá vốn + Ads + Phí sàn + Vận chuyển + Phí khác? |
| ROAS | Tính theo chi phí Ads nào? (Facebook? TikTok? Tổng?) |
| AOV | Average Order Value — confirm calculation |
| Tỷ lệ hoàn | Cách tính tỷ lệ hoàn hàng |
| Biên LN gộp / Biên LN ròng | Confirm denominator |

### Data Import
Cần khách cung cấp:

| Item | Status |
|------|--------|
| File mẫu Shopee export | ❌ Chưa có |
| File mẫu TikTok Shop export | ❌ Chưa có |
| File mẫu Ads (Facebook/TikTok/Google) | ❌ Chưa có |
| File mẫu Giá vốn | ❌ Chưa có |
| Column mapping spec per source | ❌ Chờ file mẫu |
| Quy tắc dedup khi import trùng kỳ | ❌ Chưa xác nhận |
| Thứ tự import khuyến nghị | ✅ Giá vốn → Đơn hàng → Ads (theo Figma) |

## Build Status

```
npm run lint:  0 errors, 0 warnings
npm run build: ✅ 17 routes compiled
               ⚠️ 7 Recharts SSG warnings (runtime OK)
               0 TypeScript errors
```
