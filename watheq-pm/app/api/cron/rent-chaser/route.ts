import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeChaserActions, DuePayment } from "@/lib/rentChaser";
import { waLink } from "@/lib/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * مطارد الإيجارات — يعمل يوميًّا عبر Vercel Cron (انظر vercel.json).
 * محمي بـ CRON_SECRET. على Netlify استخدم Scheduled Function (انظر README).
 */
export async function GET(req: Request) {
  // حماية النقطة (Vercel يرسل ترويسة Authorization: Bearer <CRON_SECRET>)
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // اجلب الدفعات غير المسدّدة مع بيانات المستأجر والعقار والإشعارات السابقة
  const payments = await prisma.payment.findMany({
    where: { status: { in: ["PENDING", "LATE"] } },
    include: {
      tenant: {
        include: {
          property: { include: { user: true } },
          notices: true,
        },
      },
    },
  });

  const due: DuePayment[] = payments.map((p) => {
    const t = p.tenant;
    const sentLevels = t.notices
      .filter((n) => n.paymentId === p.id)
      .map((n) => n.level as DuePayment["sentLevels"][number]);
    // إجمالي المتأخر = مجموع الدفعات غير المسدّدة لنفس المستأجر
    const totalDue = payments
      .filter((x) => x.tenantId === t.id && x.status !== "PAID")
      .reduce((s, x) => s + Number(x.amount), 0);

    return {
      paymentId: p.id,
      tenantId: t.id,
      dueDate: p.dueDate,
      amount: Number(p.amount),
      totalDue,
      paid: p.status === "PAID",
      sentLevels,
      ctx: {
        tenantName: t.name,
        nationalId: t.nationalId ?? undefined,
        unit: t.unit,
        propertyName: t.property.name,
        propertyAddress: t.property.address ?? undefined,
        contractNo: t.contractNo ?? undefined,
        landlordName: t.property.user.name,
      },
    };
  });

  const actions = computeChaserActions(due);

  // أرشف كل إشعار وأرسله (هنا: أرشفة + رابط واتساب جاهز؛ اربط مزوّد الإرسال لاحقًا)
  const results = [];
  for (const a of actions) {
    const tenant = payments.find((p) => p.id === a.paymentId)?.tenant;
    await prisma.notice.create({
      data: {
        tenantId: a.tenantId,
        paymentId: a.paymentId,
        level: a.level,
        channel: "whatsapp",
        body: a.message,
      },
    });
    // حدّث حالة الدفعة إلى متأخرة عند تجاوز الاستحقاق
    if (a.level === "LATE" || a.level === "FINAL") {
      await prisma.payment.update({ where: { id: a.paymentId }, data: { status: "LATE" } });
      await prisma.tenant.update({ where: { id: a.tenantId }, data: { status: "LATE" } }).catch(() => {});
    }
    // await sendWhatsApp(tenant?.phone, a.message);  // ← اربط Twilio/WhatsApp Cloud API هنا
    results.push({
      tenant: tenant?.name,
      level: a.level,
      daysLate: a.daysLate,
      waLink: waLink(tenant?.phone, a.message),
    });
  }

  return NextResponse.json({ ranAt: new Date().toISOString(), sent: results.length, results });
}
