// مؤشّر بصري سريع لحالة سداد المستأجر
type Status = "PAID" | "PENDING" | "LATE";

const MAP: Record<Status, { label: string; dot: string; bg: string; fg: string }> = {
  PAID:    { label: "مسدّد",  dot: "#1E9E6A", bg: "#E6F4EC", fg: "#137a50" },
  PENDING: { label: "مستحق",  dot: "#B8791F", bg: "#FBF1DF", fg: "#8a5a11" },
  LATE:    { label: "متأخر",  dot: "#D0453F", bg: "#FBE9E7", fg: "#a5322c" },
};

export default function StatusBadge({ status, monthsLate }: { status: Status; monthsLate?: number }) {
  const s = MAP[status];
  const label = status === "LATE" && monthsLate ? `متأخر ${monthsLate > 1 ? `${monthsLate} أشهر` : "شهر"}` : s.label;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {label}
    </span>
  );
}
