export function waNumber(phone?: string | null): string {
  const p = (phone || "").replace(/\D/g, "");
  if (!p) return "";
  if (p.startsWith("966")) return p;
  if (p.startsWith("0")) return "966" + p.slice(1);
  if (p.length === 9) return "966" + p;
  return p;
}

export function waLink(phone: string | undefined | null, text: string): string {
  return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
}

export const sar = (n: number) => new Intl.NumberFormat("en-US").format(Number(n) || 0);

export function daysFromDue(dueISO: string): number {
  const due = new Date(dueISO);
  const today = new Date(new Date().toDateString());
  return Math.floor((today.getTime() - new Date(due.toDateString()).getTime()) / 86_400_000);
}
