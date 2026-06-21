import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";

export type Option = { value: string; label: string };

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "image" | "select" | "date";
  required?: boolean;
  options?: Option[];
  hint?: string;
  bucket?: "tours" | "gallery" | "properties" | "blogs" | "testimonials";
};

type Row = Record<string, any>;

export function SimpleCrud({
  table,
  title,
  fields,
  columns,
  extraOptions,
  description,
}: {
  table: string;
  title: string;
  fields: Field[];
  columns: { key: string; label: string }[];
  extraOptions?: Record<string, Option[]>;
  description?: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const [saving, setSaving] = useState(false);
  const [sortKey, setSortKey] = useState<string>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
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

  const openNew = () => {
    setEditing(null);
    setForm({});
    setOpen(true);
  };
  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  };

  const save = async () => {
    for (const f of fields) {
      if (f.required && !form[f.key]) return toast.error(`${f.label} is required`);
    }
    setSaving(true);
    const payload: Row = {};
    for (const f of fields) {
      let v = form[f.key];
      if (f.type === "number") v = v === "" || v == null ? null : Number(v);
      if (f.type === "checkbox") v = Boolean(v);
      payload[f.key] = v ?? null;
    }
    const res = editing
      ? await supabase.from(table as any).update(payload).eq("id", editing.id)
      : await supabase.from(table as any).insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? "Updated" : "Created");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
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
      } else if (typeof av === "number") {
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
  }, [rows, query, sortKey, sortAsc, columns]);

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
        <div>
          <h2 className="font-display text-xl font-bold">
            {title} <span className="text-sm font-normal text-muted-foreground">({visible.length})</span>
          </h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-44 pl-8"
            />
          </div>
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <SortHead key={c.key} k={c.key} label={c.label} />
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="py-8 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((r) => (
                <TableRow key={r.id}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className="max-w-[240px] truncate">
                      {c.key === "image_url" || c.key === "cover_image" || c.key === "photo_url" ? (
                        r[c.key] ? (
                          <img src={r[c.key]} alt="" className="h-10 w-10 rounded object-cover" />
                        ) : (
                          "—"
                        )
                      ) : typeof r[c.key] === "boolean" ? (
                        r[c.key] ? "Yes" : "No"
                      ) : (
                        String(r[c.key] ?? "—")
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} {title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {fields.map((f) => {
              const opts = f.options ?? extraOptions?.[f.key];
              return (
                <div key={f.key}>
                  {f.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.key])}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                        className="h-4 w-4"
                      />
                      {f.label}
                    </label>
                  ) : (
                    <>
                      <Label>
                        {f.label}
                        {f.required && <span className="text-destructive"> *</span>}
                      </Label>
                      {f.type === "textarea" ? (
                        <Textarea
                          rows={4}
                          value={form[f.key] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        />
                      ) : f.type === "select" ? (
                        <select
                          value={form[f.key] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value || null })}
                          className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm"
                        >
                          <option value="">— None —</option>
                          {(opts ?? []).map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : f.type === "image" && f.bucket ? (
                        <ImageUploader
                          bucket={f.bucket}
                          value={form[f.key] ?? null}
                          onChange={(url) => setForm({ ...form, [f.key]: url })}
                        />
                      ) : (
                        <Input
                          type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                          value={form[f.key] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        />
                      )}
                      {f.type === "image" && !f.bucket && form[f.key] ? (
                        <img src={form[f.key]} alt="" className="mt-2 h-20 rounded object-cover" />
                      ) : null}
                      {f.hint && <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>}
                      {f.hint && <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
