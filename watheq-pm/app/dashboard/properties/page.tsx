"use client";
import { useState } from "react";
import ModeSwitcher from "@/components/ModeSwitcher";
import TenantList from "@/components/TenantList";
import type { TenantVM } from "@/components/TenantRow";

/**
 * لوحة إدارة الأملاك (الوضع الجديد).
 * البيانات هنا تجريبية للعرض الفوري. للربط الحقيقي:
 *   حوّلها Server Component واجلب المستأجرين عبر prisma.tenant.findMany(...)
 *   ثم مرّرها كـ initial إلى <TenantList/>.
 */
const LANDLORD = "مكتب اليمامة لإدارة الأملاك";

const DEMO: TenantVM[] = [
  { id: "t1", name: "عبدالله الحربي", unit: "101", phone: "", rentAmount: 2500, totalDue: 0, status: "PAID", daysLate: 0, propertyName: "برج الياسمين", landlordName: LANDLORD, contractEnd: "2026-12-01" },
  { id: "t2", name: "سارة العتيبي", unit: "204", phone: "", rentAmount: 3000, totalDue: 3000, status: "LATE", daysLate: 5, propertyName: "برج الياسمين", landlordName: LANDLORD, contractEnd: "2026-09-15" },
  { id: "t3", name: "مؤسسة النور", unit: "المحل 2", phone: "", rentAmount: 6000, totalDue: 12000, status: "LATE", daysLate: 18, propertyName: "برج الياسمين", landlordName: LANDLORD, contractEnd: "2027-03-01" },
  { id: "t4", name: "خالد القحطاني", unit: "305", phone: "", rentAmount: 2800, totalDue: 0, status: "PENDING", daysLate: 0, propertyName: "برج الياسمين", landlordName: LANDLORD, contractEnd: "2026-11-20" },
];

export default function PropertiesDashboard() {
  const [mode, setMode] = useState<"ASSOCIATION_MANAGER" | "PROPERTY_MANAGER">("PROPERTY_MANAGER");

  return (
    <div className="min-h-screen bg-[#FBF8F1]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <header className="bg-[#0E3A37] text-[#EAF1EE]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2 font-bold" style={{ fontFamily: "'Readex Pro', sans-serif" }}>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0A2C2A] text-[#E7C877]">و</span>
            وثيق
          </div>
          <ModeSwitcher mode={mode} onChange={setMode} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {mode === "PROPERTY_MANAGER" ? (
          <>
            <h1 className="mb-1 text-xl font-bold text-[#0E3A37]" style={{ fontFamily: "'Readex Pro', sans-serif" }}>
              إدارة الأملاك — برج الياسمين
            </h1>
            <p className="mb-6 text-sm text-[#5C6B67]">متابعة المستأجرين، حالات السداد، والتحصيل الآلي.</p>
            <TenantList initial={DEMO} />
          </>
        ) : (
          <div className="rounded-2xl border border-[#E4DDCD] bg-white p-8 text-center text-[#5C6B67]">
            وضع «جمعيات الملاك» — لوحة الجمعيات القائمة تُعرض هنا.
          </div>
        )}
      </main>
    </div>
  );
}
