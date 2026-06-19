import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2, Loader2, Eye, ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

type Row = Record<string, any>;

const STATUS_OPTIONS = ["new", "pending", "contacted", "confirmed", "closed", "cancelled"];

export function LeadsTable({
  table,
  title,
  columns,
  statuses = STATUS_OPTIONS,
}: {
  table: string;
  title: string;
  columns: { key: string; label: string }[];
  statuses?: string[];
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<Row | null>(null);
  const [sortKey, setSortKey] = useState<string>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const load = () => {
    setLoading(true);
    supabase
      .from(table as any)
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Row[]) ?? []);
        setLoading(false);
      });
  };
  useEffect(load, [table]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from(table as any).update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success("Status updated");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const toggleSort = (k: string) => {
    if (sortKey === k) setSortAsc((s) => !s);
    else {
      setSortKey(k);
      setSortAsc(true);
    }
  };

  const visible = useMemo(() => {
    let out = [...rows];
    if (statusFilter !== "all") out = out.filter((r) => (r.status ?? "new") === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((r) =>
        columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q)),
      );
    }
    out.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === "created_at") {
        av = new Date(av ?? 0).getTime();
        bv = new Date(bv ?? 0).getTime();
      } else if (typeof av === "number" || !isNaN(Number(av))) {
        av = Number(av ?? 0);
        bv = Number(bv ?? 0);
      } else {
        av = String(av ?? "").toLowerCase();
        bv = String(bv ?? "").toLowerCase();
      }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return out;
  }, [rows, statusFilter, query, sortKey, sortAsc, columns]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => {
      const s = r.status ?? "new";
      c[s] = (c[s] ?? 0) + 1;
    });
    return c;
  }, [rows]);

  const SortHead = ({ k, label }: { k: string; label: string }) => (
    <TableHead>
      <button
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortKey === k ? "text-primary" : "opacity-40"}`} />
      </button>
    </TableHead>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">
          {title} <span className="text-sm font-normal text-muted-foreground">({visible.length})</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-44 pl-8"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border bg-background px-2 text-sm capitalize"
          >
            <option value="all">All statuses ({rows.length})</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s} ({counts[s] ?? 0})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <SortHead key={c.key} k={c.key} label={c.label} />
              ))}
              <SortHead k="status" label="Status" />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="py-8 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((r) => (
                <TableRow key={r.id}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className="max-w-[200px] truncate">
                      {c.key === "created_at"
                        ? new Date(r[c.key]).toLocaleDateString("en-IN")
                        : String(r[c.key] ?? "—")}
                    </TableCell>
                  ))}
                  <TableCell>
                    <select
                      value={r.status ?? "new"}
                      onChange={(e) => setStatus(r.id, e.target.value)}
                      className="rounded-md border bg-background px-2 py-1 text-xs capitalize"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setView(r)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
          </DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              {Object.entries(view)
                .filter(([k]) => k !== "id")
                .map(([k, v]) => (
                  <div key={k} className="flex gap-3 border-b py-1.5">
                    <span className="w-36 shrink-0 font-medium capitalize text-muted-foreground">
                      {k.replace(/_/g, " ")}
                    </span>
                    <span className="break-words">{v == null ? "—" : String(v)}</span>
                  </div>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
