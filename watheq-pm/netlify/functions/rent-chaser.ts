// دالة مجدولة على Netlify — بديل Vercel Cron (vercel.json).
// تعمل يوميًّا الساعة 8 صباحًا وتستدعي مسار مطارد الإيجارات الداخلي
// /api/cron/rent-chaser الذي يحوي كامل المنطق: أرشفة الإشعارات المتدرّجة
// وتحديث حالات الدفع. تُمرَّر CRON_SECRET كترويسة تفويض لحماية النقطة.
const CRON_PATH = "/api/cron/rent-chaser";

export default async () => {
  const baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!baseUrl) {
    return new Response(JSON.stringify({ error: "missing_site_url" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const headers: Record<string, string> = {};
  if (process.env.CRON_SECRET) {
    headers.Authorization = `Bearer ${process.env.CRON_SECRET}`;
  }

  const res = await fetch(`${baseUrl}${CRON_PATH}`, { headers });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
};

// جدولة v2: تُقرأ مباشرة من الدالة (لا حاجة لضبطها في netlify.toml).
export const config = {
  schedule: "0 8 * * *",
};
