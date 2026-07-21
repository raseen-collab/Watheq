"use client";
import StatusBadge from "./StatusBadge";
import { sar, waLink } from "@/lib/format";
import { reminderTemplate } from "@/lib/legalTemplates";

export interface TenantVM {
  id: string;
  name: string;
  unit: string;
  phone?: string;
  rentAmount: number;
  totalDue: number;
  status: "PAID" | "PENDING" | "LATE";
  daysLate: number;
  propertyName: string;
  landlordName: string;
  contractEnd: string;
}

export default function TenantRow({
  t,
  onGenerateNotice,
  onMarkPaid,
}: {
  t: TenantVM;
  onGenerateNotice: (t: TenantVM) => void;
  onMarkPaid: (id: string) => void;
}) {
  const dueISO = new Date().toISOString().slice(0, 10);
  const reminder = reminderTemplate({
    tenantName: t.name,
    unit: t.unit,
    propertyName: t.propertyName,
    rentAmount: t.rentAmount,
    totalDue: t.totalDue,
    dueDate: dueISO,
    landlordName: t.landlordName,
  });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E4DDCD] bg-[#FBF8F1] p-3">
      <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-[#F3EEE2] font-semibold text-[#0E3A37]">
        {t.name.trim().charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[#0B211F]">{t.name}</div>
        <div className="text-xs text-[#5C6B67]">
          وحدة {t.unit} · إيجار {sar(t.rentAmount)} ريال
          {t.status === "LATE" && t.totalDue > t.rentAmount ? ` · متأخر ${sar(t.totalDue)} ريال` : ""}
        </div>
      </div>

      <StatusBadge status={t.status} monthsLate={t.status === "LATE" ? Math.max(1, Math.round(t.daysLate / 30)) : undefined} />

      <div className="flex flex-wrap justify-end gap-2">
        {t.status !== "PAID" && (
          <a
            href={waLink(t.phone, reminder)}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-[#1FA855] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#18944a]"
          >
            إرسال تذكير
          </a>
        )}
        {t.status === "LATE" && (
          <button
            onClick={() => onGenerateNotice(t)}
            className="rounded-lg bg-[#B8791F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#8a5a11]"
          >
            توليد إنذار
          </button>
        )}
        <button
          onClick={() => onMarkPaid(t.id)}
          className="rounded-lg border border-[#E4DDCD] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E3A37] hover:bg-[#F3EEE2]"
        >
          تسجيل دفعة
        </button>
      </div>
    </div>
  );
}
