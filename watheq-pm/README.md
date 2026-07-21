# وثيق — وضع إدارة الأملاك (Property Manager Mode)

توسعة لمنصة وثيق لخدمة **مديري الأملاك وأصحاب العقارات المتعددة**، جنبًا إلى جنب مع وضع **جمعيات الملاك** القائم (الوضع المزدوج). مبنية على **Next.js (App Router) + Prisma + PostgreSQL**، وجاهزة للنشر على **Vercel** أو **Netlify**.

## البنية
```
prisma/schema.prisma        مخطّط قاعدة البيانات (وضع مزدوج + مستأجرون/دفعات/إنذارات)
lib/legalTemplates.ts       النصوص القانونية المتدرّجة (تذكير/تأخير/إنذار نهائي)
lib/rentChaser.ts           منطق مطارد الإيجارات (نقي وقابل للاختبار)
lib/prisma.ts               عميل Prisma مفرد
lib/format.ts               أدوات (واتساب، عملة، أيام التأخير)
app/api/cron/rent-chaser/   نقطة Cron اليومية (Vercel) — محمية بـ CRON_SECRET
app/api/tenants/[id]/notice توليد إنذار عند الطلب
app/dashboard/properties/   صفحة لوحة إدارة الأملاك (React)
components/                  StatusBadge · TenantRow · TenantList · ModeSwitcher
```

## الإعداد المحلي
```bash
npm install
# .env
DATABASE_URL="postgresql://..."   # Neon / Supabase / Vercel Postgres
CRON_SECRET="ضع-سرًّا-قويًّا"
npx prisma migrate dev            # إنشاء الجداول
npm run dev
```
افتح `/dashboard/properties`.

## التدرّج الزمني لمطارد الإيجارات
| المستوى | التوقيت | القالب |
|---|---|---|
| تذكير ودّي | قبل الاستحقاق بـ 5 أيام | `reminderTemplate` |
| تنبيه تأخير | بعد يومين من الاستحقاق | `lateTemplate` |
| إنذار نهائي | بعد 15 يومًا | `finalTemplate` |

المنطق في `lib/rentChaser.ts` يمنع التكرار (لا يُرسل نفس المستوى مرتين لنفس الدفعة).

## النشر
**Vercel:** ادفع المشروع، أضف `DATABASE_URL` و`CRON_SECRET` في Environment Variables. ملف `vercel.json` يشغّل الـ Cron يوميًّا 8 صباحًا تلقائيًّا.

**Netlify:** استخدم `@netlify/plugin-nextjs`، وحوّل نقطة الـ Cron إلى **Scheduled Function** (انظر `netlify.toml`). أضف نفس متغيّرات البيئة.

## إرسال الرسائل فعليًّا
نقطة الـ Cron حاليًّا **تؤرشف** الإشعار وتُجهّز رابط واتساب. لأتمتة الإرسال، اربط مزوّدًا في المكان المعلّم `// ← اربط ...`:
- **WhatsApp Cloud API** (Meta) أو **Twilio WhatsApp** للرسائل الآلية.
- أو تصدير الإنذار النهائي كـ PDF للطباعة/الرفع على ناجز.

## ⚠️ تنبيه قانوني
النصوص في `lib/legalTemplates.ts` **قوالب استرشادية** صيغت لتكون رسمية وقريبة من متطلبات المطالبة عبر محاكم التنفيذ (ناجز) استنادًا إلى عقد الإيجار الموحّد ونظام التنفيذ. لكنها **يجب أن تُراجَع من محامٍ/مختص مرخّص** قبل الاعتماد الرسمي. التنفيذ عبر ناجز يتطلب عقدًا موحّدًا موثّقًا في **شبكة إيجار** واستيفاء الإجراءات النظامية، وقد تتغيّر الاشتراطات. وثيق أداة صياغة وأرشفة ولا يقدّم استشارة قانونية.
```
