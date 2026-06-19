import { useEffect, useState } from "react";
import { Activity, Inbox, CalendarCheck, Sparkles, Gift, Compass, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  source: string;
  name: string;
  detail: string;
  created_at: string;
};

const SOURCES = [
  { table: "inquiries", source: "Inquiry", icon: Inbox, color: "text-blue-500", detail: (r: any) => r.destination ?? "trip inquiry" },
  { table: "bookings", source: "Booking", icon: CalendarCheck, color: "text-emerald-500", detail: (r: any) => r.tour_title ?? "booking" },
  { table: "custom_trip_requests", source: "Custom Trip", icon: Sparkles, color: "text-purple-500", detail: (r: any) => r.destination_preference ?? "custom trip" },
  { table: "surprise_trip_requests", source: "Surprise Trip", icon: Gift, color: "text-pink-500", detail: (r: any) => r.occasion ?? "surprise trip" },
  { table: "trip_planner_requests", source: "Planner", icon: Compass, color: "text-indigo-500", detail: (r: any) => r.recommendation ?? "planner lead" },
  { table: "newsletter_subscribers", source: "Newsletter", icon: Mail, color: "text-orange-500", detail: () => "subscribed" },
];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

export function ActivityCenter() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const results = await Promise.all(
      SOURCES.map(async (s) => {
        const { data } = await supabase
          .from(s.table as any)
          .select("id,name,email,created_at," + (s.table === "newsletter_subscribers" ? "email" : "destination,tour_title,destination_preference,occasion,recommendation"))
          .order("created_at", { ascending: false })
          .limit(15);
        return ((data as any) ?? []).map((r: any) => ({
          id: `${s.table}-${r.id}`,
          source: s.source,
          name: r.name ?? r.email ?? "Someone",
          detail: s.detail(r),
          created_at: r.created_at,
        })) as Row[];
      }),
    );
    const merged = results
      .flat()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 60);
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channels = SOURCES.map((s) =>
      supabase
        .channel(`activity-${s.table}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: s.table }, () => load())
        .subscribe(),
    );
    return () => {
      channels.forEach((c) => supabase.removeChannel(c));
    };
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Activity className="size-6 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold">Activity Center</h1>
          <p className="text-sm text-muted-foreground">Real-time feed of customer submissions across your site.</p>
        </div>
      </div>
      <div className="rounded-2xl border bg-card">
        {loading ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">Loading activity…</p>
        ) : rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => {
              const meta = SOURCES.find((s) => s.source === r.source)!;
              const Icon = meta.icon;
              return (
                <li key={r.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-muted ${meta.color}`}>
                    <Icon className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{r.name}</span>{" "}
                      <span className="text-muted-foreground">submitted a</span>{" "}
                      <span className="font-medium">{r.source}</span>{" "}
                      <span className="text-muted-foreground">— {r.detail}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(r.created_at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
