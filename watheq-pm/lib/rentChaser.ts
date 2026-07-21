/**
 * وثيق — منطق «مطارد الإيجارات» الآلي.
 *
 * التدرّج الزمني (من تاريخ استحقاق الدفعة):
 *   REMINDER : تذكير ودّي  — قبل الاستحقاق بـ 5 أيام.
 *   LATE     : تنبيه تأخير — بعد يومين من الاستحقاق.
 *   FINAL    : إنذار نهائي — بعد 15 يومًا من الاستحقاق.
 *
 * الدالة نقية (Pure) وقابلة للاختبار: تستقبل الدفعات غير المسدّدة وما أُرسل
 * سابقًا، وتُرجع قائمة الإشعارات الواجب إرسالها اليوم (بلا تكرار).
 */

import { buildNotice, NoticeContext, NoticeLevel } from "./legalTemplates";

export const THRESHOLDS = { REMINDER: -5, LATE: 2, FINAL: 15 } as const;

const DAY = 86_400_000;
export function daysFromDue(dueDate: Date, today: Date): number {
  const a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const b = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  return Math.floor((a - b) / DAY);
}

export interface DuePayment {
  paymentId: string;
  tenantId: string;
  dueDate: Date;
  amount: number;      // قيمة الدورة
  totalDue: number;    // إجمالي المتأخر على المستأجر
  paid: boolean;
  sentLevels: NoticeLevel[]; // ما أُرسل مسبقًا لهذه الدفعة
  ctx: Omit<NoticeContext, "dueDate" | "daysLate" | "rentAmount" | "totalDue">;
}

export interface ChaserAction {
  paymentId: string;
  tenantId: string;
  level: NoticeLevel;
  daysLate: number;
  message: string;
}

/** يقرّر أعلى مستوى مستحق اليوم ولم يُرسل بعد */
function levelDueToday(d: number, sent: NoticeLevel[]): NoticeLevel | null {
  if (d >= THRESHOLDS.FINAL && !sent.includes("FINAL")) return "FINAL";
  if (d >= THRESHOLDS.LATE && !sent.includes("LATE")) return "LATE";
  // التذكير: خلال 5 أيام قبل الاستحقاق (d بين -5 و -1)
  if (d <= THRESHOLDS.REMINDER && d < 0 && !sent.includes("REMINDER")) return "REMINDER";
  return null;
}

export function computeChaserActions(payments: DuePayment[], today = new Date()): ChaserAction[] {
  const actions: ChaserAction[] = [];
  for (const p of payments) {
    if (p.paid) continue;
    const d = daysFromDue(p.dueDate, today);
    const level = levelDueToday(d, p.sentLevels);
    if (!level) continue;
    const daysLate = Math.max(0, d);
    const message = buildNotice(level, {
      ...p.ctx,
      rentAmount: p.amount,
      totalDue: p.totalDue,
      dueDate: p.dueDate.toISOString().slice(0, 10),
      daysLate,
    });
    actions.push({ paymentId: p.paymentId, tenantId: p.tenantId, level, daysLate, message });
  }
  return actions;
}
