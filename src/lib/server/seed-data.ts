import type { ImportJob, NormalizedRecord } from '@/lib/data-types';

const seedJobId = 'seed-demo-data';

const products = [
  { name: 'Áo thun nam cotton', sku: 'AT-COTTON', cogs: 82000 },
  { name: 'Quần short nam', sku: 'QS-NAM', cogs: 96000 },
  { name: 'Áo hoodie nam', sku: 'HD-NAM', cogs: 145000 },
  { name: 'Dép slide nam', sku: 'DEP-SLIDE', cogs: 52000 },
  { name: 'Tất cổ cao nam', sku: 'TAT-CC', cogs: 18000 },
];

const channels = [
  { source: 'shopee' as const, channel: 'Shopee', feeRate: 0.065 },
  { source: 'tiktok' as const, channel: 'TikTok Shop', feeRate: 0.058 },
  { source: 'lazada' as const, channel: 'Lazada', feeRate: 0.06 },
];

export const seedImportJobs: ImportJob[] = [
  {
    id: seedJobId,
    fileName: 'demo_phase1_seed_data.xlsx',
    source: 'shopee',
    sourceLabel: 'Dữ liệu demo Phase 1',
    dataType: 'Đơn hàng + Ads + Giá vốn',
    fileSize: 1245600,
    totalRows: 72,
    validRows: 72,
    errorRows: 0,
    status: 'success',
    importedBy: 'Nguyễn Văn A',
    importedAt: '2026-06-07T02:30:00.000Z',
    dateRangeFrom: '2026-06-01',
    dateRangeTo: '2026-06-30',
    errors: [],
    preview: [],
  },
];

export function getSeedRecords(): NormalizedRecord[] {
  const records: NormalizedRecord[] = [];

  products.forEach((product, index) => {
    records.push({
      id: `seed-cogs-${product.sku}`,
      importJobId: seedJobId,
      source: 'giavon',
      channel: 'Giá vốn',
      type: 'cogs',
      date: '2026-06-01',
      productName: product.name,
      sku: product.sku,
      status: 'success',
      quantity: 0,
      revenue: 0,
      platformFee: 0,
      refundAmount: 0,
      adsCost: 0,
      cogs: product.cogs,
      raw: { productIndex: index + 1 },
    });
  });

  for (let day = 1; day <= 30; day += 1) {
    channels.forEach((channel, channelIndex) => {
      products.forEach((product, productIndex) => {
        const quantity = 2 + ((day + productIndex + channelIndex) % 7);
        const unitPrice = product.cogs * (1.85 + productIndex * 0.08);
        const revenue = Math.round(quantity * unitPrice);
        const isIssue = day % 13 === 0 && productIndex === channelIndex;
        const refundAmount = isIssue ? Math.round(revenue * 0.35) : 0;
        const finalRevenue = isIssue ? revenue - refundAmount : revenue;

        records.push({
          id: `seed-order-${day}-${channel.source}-${product.sku}`,
          importJobId: seedJobId,
          source: channel.source,
          channel: channel.channel,
          type: 'order',
          date: `2026-06-${String(day).padStart(2, '0')}`,
          orderId: `TX-${String(day).padStart(2, '0')}-${channel.source}-${productIndex + 1}`,
          productName: product.name,
          sku: product.sku,
          status: isIssue ? 'refunded' : 'success',
          quantity,
          revenue: finalRevenue,
          platformFee: Math.round(finalRevenue * channel.feeRate),
          refundAmount,
          adsCost: 0,
          cogs: product.cogs * quantity,
          raw: { generated: true },
        });
      });
    });

    ['Shopee 6.6 Brand Day', 'TikTok New Collection', 'Remarketing đa kênh'].forEach((campaign, index) => {
      const adsCost = 780000 + day * 92000 + index * 165000;
      records.push({
        id: `seed-ads-${day}-${index}`,
        importJobId: seedJobId,
        source: 'ads',
        channel: index === 1 ? 'TikTok Ads' : index === 2 ? 'Meta Ads' : 'Shopee Ads',
        type: 'ads',
        date: `2026-06-${String(day).padStart(2, '0')}`,
        campaignName: campaign,
        status: 'success',
        quantity: 0,
        revenue: 0,
        platformFee: 0,
        refundAmount: 0,
        adsCost,
        cogs: 0,
        raw: { generated: true },
      });
    });
  }

  return records;
}
