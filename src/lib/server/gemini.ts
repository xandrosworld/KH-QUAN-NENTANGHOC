import type { AnalyticsPayload } from '@/lib/data-types';

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  error?: {
    message?: string;
  };
};

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

export function hasGeminiConfig() {
  return Boolean(getGeminiApiKey());
}

function compactAnalyticsContext(analytics: AnalyticsPayload) {
  return {
    totals: analytics.totals,
    dataQuality: analytics.dataQuality,
    channelRevenue: analytics.channelRevenue,
    costStructure: analytics.costStructure,
    topProducts: analytics.topProducts.slice(0, 8),
    topCampaigns: analytics.topCampaigns.slice(0, 8),
    recentRevenueRows: analytics.revenueDetailRows.slice(0, 10),
    profitRows: analytics.profitDetailRows.slice(0, 10),
  };
}

export async function askGeminiWithAnalytics(message: string, analytics: AnalyticsPayload) {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: [
                'Bạn là AI Copilot báo cáo kinh doanh TMĐT cho dashboard TronX.',
                'Chỉ trả lời dựa trên dữ liệu analytics được cung cấp trong prompt.',
                'Trả lời bằng tiếng Việt, ngắn gọn, thực dụng, có số liệu cụ thể.',
                'Nếu dữ liệu không đủ, nói rõ chưa đủ dữ liệu và gợi ý người dùng import thêm file.',
                'Không bịa số liệu, không đưa tư vấn kế toán/thuế/pháp lý chính thức.',
              ].join('\n'),
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: JSON.stringify(
                  {
                    question: message,
                    analytics: compactAnalyticsContext(analytics),
                  },
                  null,
                  2,
                ),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 900,
        },
      }),
      signal: AbortSignal.timeout(20000),
    },
  );

  const data = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API error ${response.status}`);
  }

  const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim();

  if (!answer) {
    throw new Error('Gemini did not return text.');
  }

  return {
    answer,
    model,
  };
}
