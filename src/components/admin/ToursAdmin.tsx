import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Copy, GripVertical, ArrowUpDown } from "lucide-react";
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

type Tour = Record<string, any>;
type ItineraryDay = { day: number; title: string; details: string };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const blank: Tour = {
  title: "",
  slug: "",
  destination: "",
  vibe: "",
  group_type: "",
  short_description: "",
  description: "",
  duration: "",
  price: 0,
  difficulty: "",
  best_season: "",
  group_size: 15,
  seats_available: 10,
  hero_image: "",
  featured: false,
  status: "published",
  inclusions: "",
  exclusions: "",
  gallery_images: "",
  departure_dates: "",
};

type SortKey = "created_at" | "title" | "destination" | "price" | "status";

export function ToursAdmin() {
  const [rows, setRows] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tour | null>(null);
  const [form, setForm] = useState<Tour>({ ...blank });
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  const load = () => {
    setLoading(true);
    supabase
      .from("tours")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Tour[]) ?? []);
        setLoading(false);
      });
  };
  useEffect(load, []);

  const set = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const fromRow = (r: Tour): Tour => ({
    ...r,
    inclusions: (r.inclusions ?? []).join(", "),
    exclusions: (r.exclusions ?? []).join(", "),
    gallery_images: (r.gallery_images ?? []).join(", "),
    departure_dates: (r.departure_dates ?? []).join(", "),
  });

  const openNew = () => {
    setEditing(null);
    setErrors({});
    setForm({ ...blank });
    setItinerary([]);
    setOpen(true);
  };
  const openEdit = (r: Tour) => {
    setEditing(r);
    setErrors({});
    setForm(fromRow(r));
    setItinerary(Array.isArray(r.itinerary) ? r.itinerary : []);
    setOpen(true);
  };
  const duplicate = (r: Tour) => {
    setEditing(null);
    setErrors({});
    const copy = fromRow(r);
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    copy.title = `${r.title} (Copy)`;
    copy.slug = "";
    copy.status = "draft";
    setForm(copy);
    setItinerary(Array.isArray(r.itinerary) ? r.itinerary : []);
    setOpen(true);
    toast.info("Editing a copy — review and save to create a new tour.");
  };

  // Itinerary helpers
  const addDay = () =>
    setItinerary((p) => [...p, { day: p.length + 1, title: "", details: "" }]);
  const updateDay = (i: number, patch: Partial<ItineraryDay>) =>
    setItinerary((p) => p.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const removeDay = (i: number) =>
    setItinerary((p) => p.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })));
  const moveDay = (i: number, dir: -1 | 1) =>
    setItinerary((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next.map((d, idx) => ({ ...d, day: idx + 1 }));
    });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = "Title is required";
    if (!form.destination?.trim()) e.destination = "Destination is required";
    if (!form.duration?.trim()) e.duration = "Duration is required (e.g. 6 Days / 5 Nights)";
    if (form.price === "" || form.price == null || Number(form.price) <= 0)
      e.price = "Enter a price greater than 0";
    if (!form.short_description?.trim())
      e.short_description = "A short description is required";
    if (form.seats_available !== "" && Number(form.seats_available) < 0)
      e.seats_available = "Seats cannot be negative";
    itinerary.forEach((d, i) => {
      if (!d.title?.trim()) e[`itin_${i}`] = `Day ${i + 1} needs a title`;
    });
    setErrors(e);
    return e;
  };

  const save = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      toast.error(`Please fix ${Object.keys(e).length} field(s) before saving.`);
      return;
    }
    const toArr = (s: string) =>
      (s ?? "")
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      slug: form.slug?.trim() || slugify(form.title),
      destination: form.destination || null,
      vibe: form.vibe || null,
      group_type: form.group_type || null,
      short_description: form.short_description || null,
      description: form.description || null,
      duration: form.duration || null,
      price: Number(form.price) || 0,
      difficulty: form.difficulty || null,
      best_season: form.best_season || null,
      group_size: Number(form.group_size) || null,
      seats_available: Number(form.seats_available) || 0,
      hero_image: form.hero_image || null,
      featured: Boolean(form.featured),
      status: form.status || "draft",
      inclusions: toArr(form.inclusions),
      exclusions: toArr(form.exclusions),
      gallery_images: toArr(form.gallery_images),
      departure_dates: toArr(form.departure_dates),
      itinerary: itinerary.map((d, i) => ({ day: i + 1, title: d.title, details: d.details })),
    };
    setSaving(true);
    const res = editing
      ? await supabase.from("tours").update(payload).eq("id", editing.id)
      : await supabase.from("tours").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? "Tour updated" : "Tour created");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this tour?")) return;
    const { error } = await supabase.from("tours").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc((s) => !s);
    else {
      setSortKey(k);
      setSortAsc(true);
    }
  };

  const sorted = [...rows].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (sortKey === "price") {
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

  const SortHead = ({ k, label }: { k: SortKey; label: string }) => (
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Tours</h2>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> Add Tour
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead k="title" label="Title" />
              <SortHead k="destination" label="Destination" />
              <SortHead k="price" label="Price" />
              <SortHead k="status" label="Status" />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>{r.destination ?? "—"}</TableCell>
                  <TableCell>₹{Number(r.price ?? 0).toLocaleString("en-IN")}</TableCell>
                  <TableCell className="capitalize">{r.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Duplicate" onClick={() => duplicate(r)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete" onClick={() => remove(r.id)}>
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
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Tour" : "Add Tour"}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Fields marked <span className="text-destructive">*</span> are required.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Title" required value={form.title} error={errors.title}
              hint="Public name of the trip, e.g. Spiti Valley Expedition"
              onChange={(v) => set("title", v)}
            />
            <Field
              label="Slug" value={form.slug}
              hint="Leave empty to auto-generate from the title"
              onChange={(v) => set("slug", v)}
            />
            <Field
              label="Destination" required value={form.destination} error={errors.destination}
              hint="e.g. Spiti, Kerala, Goa" onChange={(v) => set("destination", v)}
            />
            <Field
              label="Vibe" value={form.vibe}
              hint="e.g. Adventure, Relaxation, Spiritual" onChange={(v) => set("vibe", v)}
            />
            <Field
              label="Group Type" value={form.group_type}
              hint="e.g. Friends, Family, Couples, Solo" onChange={(v) => set("group_type", v)}
            />
            <Field
              label="Duration" required value={form.duration} error={errors.duration}
              hint="e.g. 6 Days / 5 Nights" onChange={(v) => set("duration", v)}
            />
            <Field
              label="Price (₹ per person)" required type="number" value={form.price} error={errors.price}
              hint="Whole number, e.g. 18999" onChange={(v) => set("price", v)}
            />
            <Field
              label="Difficulty" value={form.difficulty}
              hint="e.g. Easy, Moderate, Challenging" onChange={(v) => set("difficulty", v)}
            />
            <Field
              label="Best Season" value={form.best_season}
              hint="e.g. May–October" onChange={(v) => set("best_season", v)}
            />
            <Field
              label="Group Size" type="number" value={form.group_size}
              hint="Max travellers per batch" onChange={(v) => set("group_size", v)}
            />
            <Field
              label="Seats Available" type="number" value={form.seats_available} error={errors.seats_available}
              hint="Remaining seats to show urgency" onChange={(v) => set("seats_available", v)}
            />
            <Field
              label="Hero Image URL" value={form.hero_image}
              hint="Main banner image link" onChange={(v) => set("hero_image", v)}
            />
          </div>

          <div className="mt-3 space-y-3">
            <FieldArea
              label="Short Description" required rows={2} value={form.short_description}
              error={errors.short_description} hint="One line shown on tour cards"
              onChange={(v) => set("short_description", v)}
            />
            <FieldArea
              label="Description" rows={3} value={form.description}
              hint="Full overview shown on the tour detail page"
              onChange={(v) => set("description", v)}
            />
            <FieldArea
              label="Inclusions" rows={2} value={form.inclusions}
              hint="Comma separated, e.g. Stay, Meals, Transport"
              onChange={(v) => set("inclusions", v)}
            />
            <FieldArea
              label="Exclusions" rows={2} value={form.exclusions}
              hint="Comma separated, e.g. Flights, Personal expenses"
              onChange={(v) => set("exclusions", v)}
            />
            <FieldArea
              label="Gallery Image URLs" rows={2} value={form.gallery_images}
              hint="Comma separated image links" onChange={(v) => set("gallery_images", v)}
            />
            <Field
              label="Departure Dates" value={form.departure_dates}
              hint="YYYY-MM-DD, comma separated, e.g. 2026-05-10, 2026-06-14"
              onChange={(v) => set("departure_dates", v)}
            />

            {/* Visual itinerary builder */}
            <div className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Day-by-Day Itinerary</Label>
                  <p className="text-xs text-muted-foreground">
                    Add a card for each day — no JSON needed.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addDay}>
                  <Plus className="mr-1 h-4 w-4" /> Add Day
                </Button>
              </div>
              {itinerary.length === 0 && (
                <p className="py-3 text-center text-xs text-muted-foreground">
                  No days added yet. Click “Add Day” to build the itinerary.
                </p>
              )}
              <div className="space-y-3">
                {itinerary.map((d, i) => (
                  <div key={i} className="rounded-md border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-bold text-primary">
                        <GripVertical className="h-3 w-3" /> Day {i + 1}
                      </span>
                      <div className="flex gap-1">
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7"
                          onClick={() => moveDay(i, -1)} disabled={i === 0}>
                          ↑
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7"
                          onClick={() => moveDay(i, 1)} disabled={i === itinerary.length - 1}>
                          ↓
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7"
                          onClick={() => removeDay(i)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      placeholder="Day title, e.g. Arrival in Manali & local sightseeing"
                      value={d.title}
                      onChange={(e) => updateDay(i, { title: e.target.value })}
                      className={errors[`itin_${i}`] ? "border-destructive" : ""}
                    />
                    {errors[`itin_${i}`] && (
                      <p className="mt-1 text-xs text-destructive">{errors[`itin_${i}`]}</p>
                    )}
                    <Textarea
                      rows={2}
                      className="mt-2"
                      placeholder="Details for this day (activities, stay, meals)…"
                      value={d.details}
                      onChange={(e) => updateDay(i, { details: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="h-4 w-4"
                />
                Featured on home page
              </label>
              <div className="flex items-center gap-2 text-sm">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="rounded-md border bg-background px-2 py-1"
                >
                  <option value="draft">Draft (hidden)</option>
                  <option value="published">Published (live)</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Hoisted field components so inputs keep focus while typing */
function Field({
  label, value, onChange, type = "text", required, error, hint,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
  type?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-destructive" : ""}
      />
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function FieldArea({
  label, value, onChange, rows = 2, required, error, hint,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
  rows?: number;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-destructive" : ""}
      />
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
