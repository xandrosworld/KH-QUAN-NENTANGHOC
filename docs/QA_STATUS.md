# QA Status — TronX AI Dashboard

> Last updated: 2026-06-07 (Phase 1 backend/UI pass)

## Accepted UI Screens

| Route | Screen | Status | Notes |
|-------|--------|--------|-------|
| `/login` | Login | ✅ Accepted | Hero đã chuyển sang asset no-text + HTML overlay |
| `/dashboard` | Dashboard chính | ✅ Accepted | KPI cards, line chart, donut chart, 2 tables |
| `/dashboard/import` | Import dữ liệu | ✅ Accepted | Stepper, source select, upload, file validation |
| `/dashboard/reports/revenue` | Báo cáo doanh thu | ✅ Accepted | KPIs, charts, detail table |
| `/dashboard/reports/profit` | Báo cáo lợi nhuận | ✅ Accepted | KPIs, 3 charts, detail table |
| `/dashboard/reports/products` | Báo cáo sản phẩm | ✅ Implemented | KPI cards + top product table |
| `/dashboard/reports/campaigns` | Báo cáo campaign | ✅ Implemented | Ads KPI + top campaign table |
| `/dashboard/reports/platforms` | Báo cáo theo nền tảng | ✅ Implemented | Channel cards + revenue share |
| `/dashboard/data-management` | Quản lý dữ liệu | ✅ Implemented | Summary, import table, detail panel |
| `/dashboard/settings/kpi` | Cài đặt công thức/KPI | ✅ Implemented | Phase 1 formulas |
| `/dashboard/settings/shops` | Quản lý shop/nền tảng | ✅ Implemented | Import/API source status |
| `/dashboard/settings/system` | Cài đặt hệ thống | ✅ Implemented | Phase 1 system status |

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

## Backend/API Status

| API | Status | Notes |
|-----|--------|-------|
| `GET /api/analytics` | ✅ Implemented | Tính KPI/dashboard từ imported records hoặc seed fallback |
| `GET /api/imports` | ✅ Implemented | Trả lịch sử import + summary + detail |
| `POST /api/imports` | ✅ Implemented | Nhận `.csv/.xlsx/.xls`, parse và normalize theo source |
| `POST /api/chat` | ✅ Implemented | Trả lời data-aware theo analytics hiện tại |
| `POST /api/auth/login` | ✅ Implemented | Admin login + httpOnly session cookie |
| `POST /api/auth/logout` | ✅ Implemented | Xóa session |

## Auth / Demo Credentials

| Item | Value |
|------|-------|
| Email | `admin@tronx.vn` hoặc `admin` |
| Password | `admin123` |
| Env override | `TRONX_ADMIN_EMAIL`, `TRONX_ADMIN_PASSWORD` |
| Session | `tronx_session` httpOnly cookie |

## Remaining Non-blocking Items

| Item | Status |
|------|--------|
| File mẫu khách hàng | ⏳ Chờ khách gửi để khóa mapping header thực tế |
| AI provider key | ⏳ Chờ cấu hình tài khoản/API key nếu muốn dùng model bên thứ ba |
| Persistent storage | ⏳ Cấu hình `TRONX_DATA_DIR` trỏ tới Railway volume nếu muốn import history bền qua redeploy |
| API realtime/connect shop | ⏭️ Phase sau / scope bổ sung |

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
Công thức Phase 1 đã đưa vào engine:

| KPI | Formula |
|-----|---------|
| Doanh thu | Tổng giá trị đơn thành công |
| Phí sàn | Shopee/TikTok thu |
| Hoàn/Hủy | Tổng đơn hoàn + hủy |
| Giá vốn | Số lượng bán × giá vốn |
| Ads | Tổng chi phí quảng cáo |
| Gross Profit | Doanh thu - Giá vốn |
| Net Profit | Doanh thu - Giá vốn - Ads - Phí sàn - Hoàn/Hủy |
| Margin | Net Profit / Doanh thu × 100 |
| ROAS | Doanh thu / Chi phí Ads |
| CPA | Chi phí Ads / Số đơn |

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
