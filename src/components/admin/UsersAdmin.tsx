import { useEffect, useState } from "react";
import { Loader2, Search, Mail, Phone, Calendar, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
};

type Counts = { bookings: number; inquiries: number; custom: number; surprise: number };

export function UsersAdmin() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [counts, setCounts] = useState<Record<string, Counts>>({});
  const [staffIds, setStaffIds] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id,name,email,phone,created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      const profiles = (data as Profile[]) ?? [];
      setRows(profiles);

      const { data: roles } = await supabase.from("user_roles").select("user_id");
      setStaffIds(new Set(((roles as { user_id: string }[]) ?? []).map((r) => r.user_id)));

      // Activity counts by email (parallel)
      const emails = profiles.map((p) => p.email).filter(Boolean) as string[];
      const map: Record<string, Counts> = {};
      await Promise.all(
        emails.map(async (email) => {
          const [b, i, c, s] = await Promise.all([
            supabase.from("bookings").select("*", { count: "exact", head: true }).eq("email", email),
            supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("email", email),
            supabase.from("custom_trip_requests").select("*", { count: "exact", head: true }).eq("email", email),
            supabase.from("surprise_trip_requests").select("*", { count: "exact", head: true }).eq("email", email),
          ]);
          map[email] = {
            bookings: b.count ?? 0,
            inquiries: i.count ?? 0,
            custom: c.count ?? 0,
            surprise: s.count ?? 0,
          };
        }),
      );
      setCounts(map);
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      (r.name ?? "").toLowerCase().includes(s) ||
      (r.email ?? "").toLowerCase().includes(s) ||
      (r.phone ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All registered accounts with their contact details and activity.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…" className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const c = r.email ? counts[r.email] : undefined;
                const isStaff = staffIds.has(r.id);
                const total = c ? c.bookings + c.inquiries + c.custom + c.surprise : 0;
                return (
                  <tr key={r.id} className="border-t hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                          {(r.name ?? r.email ?? "?").slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium">{r.name ?? "—"}</p>
                          <p className="text-[11px] text-muted-foreground">{r.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.email ? (
                        <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                          <Mail className="size-3.5" /> {r.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.phone ? (
                        <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                          <Phone className="size-3.5" /> {r.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c ? (
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          {c.bookings > 0 && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600">Bookings {c.bookings}</span>}
                          {c.inquiries > 0 && <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-600">Inquiries {c.inquiries}</span>}
                          {c.custom > 0 && <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-purple-600">Custom {c.custom}</span>}
                          {c.surprise > 0 && <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-pink-600">Surprise {c.surprise}</span>}
                          {total === 0 && <span className="text-muted-foreground">No activity</span>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isStaff ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          <ShieldCheck className="size-3" /> Staff
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Customer</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
