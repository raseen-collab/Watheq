import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildNotice, NoticeLevel } from "@/lib/legalTemplates";
import { daysFromDue } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * توليد إنذار عند الطلب (زر «توليد إنذار» في اللوحة).
 * POST /api/tenants/:id/notice   body: { level: "REMINDER"|"LATE"|"FINAL", save?: boolean }
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { level = "FINAL", save = true } = (await req.json().catch(() => ({}))) as {
    level?: NoticeLevel;
    save?: boolean;
  };

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      property: { include: { user: true } },
      payments: { where: { status: { in: ["PENDING", "LATE"] } }, orderBy: { dueDate: "asc" } },
    },
  });
  if (!tenant) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const oldest = tenant.payments[0];
  const totalDue = tenant.payments.reduce((s, p) => s + Number(p.amount), 0);
  const dueISO = oldest ? oldest.dueDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  const body = buildNotice(level, {
    tenantName: tenant.name,
    nationalId: tenant.nationalId ?? undefined,
    unit: tenant.unit,
    propertyName: tenant.property.name,
    propertyAddress: tenant.property.address ?? undefined,
    contractNo: tenant.contractNo ?? undefined,
    landlordName: tenant.property.user.name,
    rentAmount: Number(tenant.rentAmount),
    totalDue: totalDue || Number(tenant.rentAmount),
    dueDate: dueISO,
    daysLate: oldest ? Math.max(0, daysFromDue(dueISO)) : 0,
    date: new Date().toISOString().slice(0, 10),
  });

  if (save) {
    await prisma.notice.create({
      data: { tenantId: tenant.id, paymentId: oldest?.id, level, channel: "pdf", body },
    });
  }

  return NextResponse.json({ level, body });
}
