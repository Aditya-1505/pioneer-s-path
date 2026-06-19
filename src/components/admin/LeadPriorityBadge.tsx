export function getLeadPriority(budget?: string | number | null): "hot" | "warm" | "cold" | null {
  if (budget == null) return null;
  const n = Number(String(budget).replace(/[^0-9]/g, ""));
  if (!n || Number.isNaN(n)) return null;
  if (n > 50000) return "hot";
  if (n >= 20000) return "warm";
  return "cold";
}

const STYLES = {
  hot: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  warm: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  cold: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
} as const;

export function LeadPriorityBadge({ budget }: { budget?: string | number | null }) {
  const p = getLeadPriority(budget);
  if (!p) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STYLES[p]}`}>
      <span className="size-1.5 rounded-full bg-current" /> {p}
    </span>
  );
}
