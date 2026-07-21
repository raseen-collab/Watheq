"use client";
import { useMemo, useState } from "react";
import TenantRow, { TenantVM } from "./TenantRow";
import { sar } from "@/lib/format";
import { LEGAL_DISCLAIMER, NoticeLevel } from "@/lib/legalTemplates";

export default function TenantList({ initial }: { initial: TenantVM[] }) {
  const [tenants, setTenants] = useState<TenantVM[]>(initial);
  const [notice, setNotice] = useState<{ name: string; body: string } | null>(null);
  const [form, setForm] = useState({ name: "", unit: "", rent: "" });

  const stats = useMemo(() => {
    const total = tenants.length;
    const late = tenants.filter((t) => t.status === "LATE");
    const collected = tenants.filter((t) => t.status === "PAID").reduce((s, t) => s + t.rentAmount, 0);
    const overdue = late.reduce((s, t) => s + t.totalDue, 0);
    const pct = total ? Math.round(((total - late.length) / total) * 100) : 0;
    return { total, late: late.length, collected, overdue, pct };
  }, [tenants]);

  async function generateNotice(t: TenantVM) {
    // في الإنتاج: POST /api/tenants/:id/notice — هنا نولّد محليًّا للعرض الفوري
    try {
      const res = await fetch(`/api/tenants/${t.id}/notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: "FINAL" as NoticeLevel }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotice({ name: t.name, body: data.body });
        return;
      }
    } catch {}
    // احتياط بدون خادم: نداء القالب مباشرة
    const { buildNotice } = await import("@/lib/legalTemplates");
    setNotice({
      name: t.name,
      body: buildNotice("FINAL", {
        tenantName: t.name, unit: t.unit, propertyName: t.propertyName,
        rentAmount: t.rentAmount, totalDue: t.totalDue,
        dueDate: new Date().toISOString().slice(0, 10),
        daysLate: t.daysLate, landlordName: t.landlordName, date: new Date().toISOString().slice(0, 10),
      }),
    });
  }

  function markPaid(id: string) {
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: "PAID", totalDue: 0, daysLate: 0 } : t)));
  }

  function addTenant() {
    const rent = Number(form.rent) || 0;
    if (!form.name.trim() || !rent) return;
    const ref = tenants[0];
    setTenants((prev) => [
      ...prev,
      {
        id: "t" + Math.random().toString(36).slice(2, 7),
        name: form.name.trim(),
        unit: form.unit.trim() || "—",
        phone: "",
        rentAmount: rent,
        totalDue: 0,
        status: "PENDING",
        daysLate: 0,
        propertyName: ref?.propertyName || "عقاري",
        landlordName: ref?.landlordName || "مدير الأملاك",
        contractEnd: "",
      },
    ]);
    setForm({ name: "", unit: "", rent: "" });
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat v={`${stats.pct}٪`} l="نسبة التحصيل" tone="ok" />
        <Stat v={String(stats.late)} l="مستأجرون متأخرون" tone={stats.late ? "warn" : undefined} />
        <Stat v={sar(stats.overdue)} l="إجمالي المتأخر (ريال)" tone={stats.overdue ? "warn" : undefined} />
        <Stat v={sar(stats.collected)} l="المُحصّل هذا الشهر (ريال)" />
      </div>

      <div className="rounded-2xl border border-[#E4DDCD] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E4DDCD] px-5 py-4">
          <h2 className="font-semibold text-[#0B211F]">المستأجرون</h2>
          <span className="text-sm text-[#5C6B67]">{stats.total} وحدة</span>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم المستأجر" className="rounded-lg border border-[#E4DDCD] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#B8791F]" />
            <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="الوحدة" className="rounded-lg border border-[#E4DDCD] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#B8791F]" />
            <input value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} type="number" placeholder="الإيجار (ريال)" className="rounded-lg border border-[#E4DDCD] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#B8791F]" />
            <button onClick={addTenant} className="rounded-lg bg-[#B8791F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8a5a11]">إضافة مستأجر</button>
          </div>
          {tenants.map((t) => (
            <TenantRow key={t.id} t={t} onGenerateNotice={generateNotice} onMarkPaid={markPaid} />
          ))}
        </div>
      </div>

      {notice && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setNotice(null)}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 font-bold text-[#0E3A37]">إنذار نهائي — {notice.name}</h3>
            <p className="mb-4 text-xs text-[#B8791F]">{LEGAL_DISCLAIMER}</p>
            <pre className="whitespace-pre-wrap rounded-xl border border-[#E4DDCD] bg-[#FBF8F1] p-4 text-sm leading-7 text-[#0B211F]" style={{ fontFamily: "inherit" }}>
{notice.body}
            </pre>
            <div className="mt-4 flex gap-2">
              <button onClick={() => navigator.clipboard?.writeText(notice.body)} className="flex-1 rounded-lg bg-[#0E3A37] px-4 py-2 font-semibold text-white">نسخ النص</button>
              <button onClick={() => window.print()} className="flex-1 rounded-lg border border-[#E4DDCD] px-4 py-2 font-semibold text-[#0E3A37]">طباعة / PDF</button>
              <button onClick={() => setNotice(null)} className="rounded-lg px-4 py-2 text-[#5C6B67]">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ v, l, tone }: { v: string; l: string; tone?: "ok" | "warn" }) {
  const color = tone === "ok" ? "#1E9E6A" : tone === "warn" ? "#D0453F" : "#0E3A37";
  return (
    <div className="rounded-xl border border-[#E4DDCD] bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold leading-none" style={{ color, fontFamily: "'Readex Pro', sans-serif" }}>{v}</div>
      <div className="mt-1.5 text-sm text-[#5C6B67]">{l}</div>
    </div>
  );
}
