import { NextResponse } from 'next/server';
import { buildAnalytics } from '@/lib/server/analytics';
import { requireApiSession } from '@/lib/server/api-auth';
import { getActiveRecords } from '@/lib/server/data-store';
import { askGeminiWithAnalytics, hasGeminiConfig } from '@/lib/server/gemini';

export const dynamic = 'force-dynamic';

function formatVnd(value: number) {
  return `${Math.round(value).toLocaleString('vi-VN')} đ`;
}

function formatPercent(value: number) {
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

function includesAny(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

export async function POST(request: Request) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const message = String(body.message ?? '').trim().toLowerCase();
  const analytics = buildAnalytics(await getActiveRecords(auth.session.sub));
  const { totals } = analytics;

  if (!message) {
    return NextResponse.json({ answer: 'Bạn muốn xem chỉ số nào: doanh thu, net profit, ROAS, top sản phẩm hay top campaign?' });
  }

  if (hasGeminiConfig()) {
    try {
      const result = await askGeminiWithAnalytics(String(body.message ?? '').trim(), analytics);
      return NextResponse.json({
        answer: result.answer,
        provider: 'gemini',
        model: result.model,
        analytics: { totals },
      });
    } catch (error) {
      console.error('Gemini chat failed, falling back to local analytics answer:', error);
    }
  }

  let answer = '';

  if (includesAny(message, ['doanh thu', 'revenue', 'bán được'])) {
    answer = `Doanh thu hiện tại là ${formatVnd(totals.revenue)} từ ${totals.orders.toLocaleString('vi-VN')} đơn hàng. AOV trung bình đạt ${formatVnd(totals.aov)}.`;
  } else if (includesAny(message, ['lợi nhuận', 'net profit', 'profit', 'lãi'])) {
    answer = `Net Profit hiện tại là ${formatVnd(totals.netProfit)}. Gross Profit là ${formatVnd(totals.grossProfit)}, margin ròng khoảng ${formatPercent(totals.margin)}.`;
  } else if (includesAny(message, ['ads', 'quảng cáo', 'roas', 'cpa'])) {
    answer = `Chi phí Ads hiện tại là ${formatVnd(totals.adsCost)}. ROAS đạt ${totals.roas.toFixed(2)}x và CPA khoảng ${formatVnd(totals.cpa)} mỗi đơn.`;
  } else if (includesAny(message, ['hoàn', 'hủy', 'huỷ', 'refund'])) {
    answer = `Tỷ lệ hoàn/hủy hiện khoảng ${formatPercent(totals.refundRate)}, giá trị hoàn/hủy ghi nhận ${formatVnd(totals.refundAmount)}.`;
  } else if (includesAny(message, ['top sản phẩm', 'sản phẩm', 'product'])) {
    const top = analytics.topProducts.slice(0, 3).map((item) => `${item.rank}. ${item.name}: ${item.revenue}`).join('\n');
    answer = `Top sản phẩm theo lợi nhuận:\n${top}`;
  } else if (includesAny(message, ['campaign', 'chiến dịch'])) {
    const top = analytics.topCampaigns.slice(0, 3).map((item) => `${item.rank}. ${item.name}: ROAS ${item.roas}x`).join('\n');
    answer = `Top campaign theo ROAS:\n${top || 'Chưa có dữ liệu campaign/ads để xếp hạng.'}`;
  } else {
    answer = `Tổng quan nhanh: doanh thu ${formatVnd(totals.revenue)}, net profit ${formatVnd(totals.netProfit)}, ROAS ${totals.roas.toFixed(2)}x, margin ${formatPercent(totals.margin)}. Bạn có thể hỏi sâu hơn về doanh thu, lợi nhuận, ads, hoàn/hủy, top sản phẩm hoặc campaign.`;
  }

  return NextResponse.json({ answer, analytics: { totals } });
}
