"use client";
// مبدّل الوضع المزدوج — يظهر أعلى اللوحة
type Mode = "ASSOCIATION_MANAGER" | "PROPERTY_MANAGER";

const LABELS: Record<Mode, string> = {
  ASSOCIATION_MANAGER: "جمعيات الملاك",
  PROPERTY_MANAGER: "إدارة الأملاك",
};

export default function ModeSwitcher({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-white/20 bg-white/10 p-1">
      {(Object.keys(LABELS) as Mode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            mode === m ? "bg-[#E7C877] text-[#0A2C2A]" : "text-[#EAF1EE] hover:bg-white/10"
          }`}
        >
          {LABELS[m]}
        </button>
      ))}
    </div>
  );
}
