import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Copy, GripVertical, ArrowUpDown, X } from "lucide-react";
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

type Tour = Record<string, any>;
type ItineraryDay = { day: number; title: string; details: string; image?: string | null; logistics?: string };
type SmartAddon = { name: string; price: number; description?: string };
type DestinationHighlight = { place: string; fact?: string; food?: string; activities?: string; image?: string | null };
type TripFaq = { question: string; answer: string };

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
  departure_dates: "",
  best_months_label: "",
  best_months_description: "",
};

type SortKey = "created_at" | "title" | "destination" | "price" | "status";

export function ToursAdmin() {
  const [rows, setRows] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tour | null>(null);
  const [form, setForm] = useState<Tour>({ ...blank });
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [smartAddons, setSmartAddons] = useState<SmartAddon[]>([]);
  const [highlights, setHighlights] = useState<DestinationHighlight[]>([]);
  const [tripFaqs, setTripFaqs] = useState<TripFaq[]>([]);
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
    departure_dates: (r.departure_dates ?? []).join(", "),
  });

  const openNew = () => {
    setEditing(null);
    setErrors({});
    setForm({ ...blank });
    setItinerary([]);
    setGalleryImages([]);
    setPropertyImages([]);
    setSmartAddons([]);
    setHighlights([]);
    setTripFaqs([]);
    setOpen(true);
  };
  const openEdit = (r: Tour) => {
    setEditing(r);
    setErrors({});
    setForm(fromRow(r));
    setItinerary(Array.isArray(r.itinerary) ? r.itinerary : []);
    setGalleryImages(Array.isArray(r.gallery_images) ? r.gallery_images : []);
    setPropertyImages(Array.isArray(r.property_images) ? r.property_images : []);
    setSmartAddons(Array.isArray(r.smart_addons) ? r.smart_addons : []);
    setHighlights(Array.isArray(r.destination_highlights) ? r.destination_highlights : []);
    setTripFaqs(Array.isArray(r.trip_faqs) ? r.trip_faqs : []);
    setOpen(true);
  };
  const duplicate = (r: Tour) => {
    openEdit(r);
    setEditing(null);
    setForm((f) => ({ ...f, title: `${r.title} (Copy)`, slug: "", status: "draft" }));
    toast.info("Editing a copy — review and save to create a new tour.");
  };

  // Itinerary helpers
  const addDay = () =>
    setItinerary((p) => [...p, { day: p.length + 1, title: "", details: "", image: null, logistics: "" }]);
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

    const payload: any = {
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
      gallery_images: galleryImages,
      property_images: propertyImages,
      smart_addons: smartAddons,
      destination_highlights: highlights,
      trip_faqs: tripFaqs,
      best_months_label: form.best_months_label || null,
      best_months_description: form.best_months_description || null,
      departure_dates: toArr(form.departure_dates),
      itinerary: itinerary.map((d, i) => ({
        day: i + 1,
        title: d.title,
        details: d.details,
        image: d.image ?? null,
        logistics: d.logistics ?? "",
      })),
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
    let av: any = a[sortKey];
    let bv: any = b[sortKey];
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
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Tour" : "Add Tour"}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Fields marked <span className="text-destructive">*</span> are required.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Title" required value={form.title} error={errors.title}
              hint="Public name of the trip, e.g. Spiti Valley Expedition" onChange={(v) => set("title", v)} />
            <Field label="Slug" value={form.slug}
              hint="Leave empty to auto-generate from the title" onChange={(v) => set("slug", v)} />
            <Field label="Destination" required value={form.destination} error={errors.destination}
              hint="e.g. Spiti, Kerala, Goa" onChange={(v) => set("destination", v)} />
            <Field label="Vibe" value={form.vibe} hint="e.g. Adventure, Relaxation" onChange={(v) => set("vibe", v)} />
            <Field label="Group Type" value={form.group_type} hint="e.g. Friends, Family" onChange={(v) => set("group_type", v)} />
            <Field label="Duration" required value={form.duration} error={errors.duration}
              hint="e.g. 6 Days / 5 Nights" onChange={(v) => set("duration", v)} />
            <Field label="Price (₹ per person)" required type="number" value={form.price} error={errors.price}
              hint="Whole number, e.g. 18999" onChange={(v) => set("price", v)} />
            <Field label="Difficulty" value={form.difficulty} hint="e.g. Easy, Moderate" onChange={(v) => set("difficulty", v)} />
            <Field label="Best Season" value={form.best_season} hint="e.g. May–October" onChange={(v) => set("best_season", v)} />
            <Field label="Group Size" type="number" value={form.group_size} hint="Max travellers per batch" onChange={(v) => set("group_size", v)} />
            <Field label="Seats Available" type="number" value={form.seats_available} error={errors.seats_available}
              hint="Remaining seats to show urgency" onChange={(v) => set("seats_available", v)} />
          </div>

          {/* HERO IMAGE — uploader */}
          <Section title="Hero Image" hint="The main banner shown on the tour card and detail page.">
            <ImageUploader bucket="tours" value={form.hero_image} onChange={(url) => set("hero_image", url ?? "")} />
          </Section>

          <div className="mt-3 space-y-3">
            <FieldArea label="Short Description" required rows={2} value={form.short_description}
              error={errors.short_description} hint="One line shown on tour cards" onChange={(v) => set("short_description", v)} />
            <FieldArea label="Description" rows={3} value={form.description}
              hint="Full overview shown on the tour detail page" onChange={(v) => set("description", v)} />
            <FieldArea label="Inclusions" rows={2} value={form.inclusions}
              hint="Comma separated, e.g. Stay, Meals, Transport" onChange={(v) => set("inclusions", v)} />
            <FieldArea label="Exclusions" rows={2} value={form.exclusions}
              hint="Comma separated, e.g. Flights, Personal expenses" onChange={(v) => set("exclusions", v)} />
            <Field label="Departure Dates" value={form.departure_dates}
              hint="YYYY-MM-DD, comma separated, e.g. 2026-05-10, 2026-06-14" onChange={(v) => set("departure_dates", v)} />
          </div>

          {/* GALLERY (multi upload) */}
          <Section title="Gallery Images" hint="Drag-and-drop multiple photos that showcase the tour.">
            <ImageUploader bucket="tours" multiple value={galleryImages} onChange={setGalleryImages} />
          </Section>

          {/* PROPERTY / ACCOMMODATION IMAGES */}
          <Section title="Accommodation Photos" hint="Show the actual properties (3-Star / 4-Star stays) travellers will live in.">
            <ImageUploader bucket="properties" multiple value={propertyImages} onChange={setPropertyImages} />
          </Section>

          {/* BEST MONTHS */}
          <Section title="When to Go" hint="Highlight the optimal travel window for this destination.">
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <Input placeholder="e.g. May to September"
                value={form.best_months_label ?? ""} onChange={(e) => set("best_months_label", e.target.value)} />
              <Textarea rows={2} placeholder="Why this season is magical — weather, scenery, festivals…"
                value={form.best_months_description ?? ""} onChange={(e) => set("best_months_description", e.target.value)} />
            </div>
          </Section>

          {/* ITINERARY — visual builder with image + logistics */}
          <Section title="Day-by-Day Itinerary" hint="Each day gets its own photo and travel logistics badge.">
            <div className="mb-2 flex items-center justify-end">
              <Button type="button" size="sm" variant="outline" onClick={addDay}>
                <Plus className="mr-1 h-4 w-4" /> Add Day
              </Button>
            </div>
            {itinerary.length === 0 && (
              <p className="py-3 text-center text-xs text-muted-foreground">
                No days added yet. Click "Add Day" to build the itinerary.
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
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveDay(i, -1)} disabled={i === 0}>↑</Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveDay(i, 1)} disabled={i === itinerary.length - 1}>↓</Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeDay(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    placeholder="Day title, e.g. Arrival in Manali"
                    value={d.title}
                    onChange={(e) => updateDay(i, { title: e.target.value })}
                    className={errors[`itin_${i}`] ? "border-destructive" : ""}
                  />
                  {errors[`itin_${i}`] && <p className="mt-1 text-xs text-destructive">{errors[`itin_${i}`]}</p>}
                  <Textarea rows={2} className="mt-2" placeholder="Details for this day (activities, stay, meals)…"
                    value={d.details} onChange={(e) => updateDay(i, { details: e.target.value })} />
                  <Input className="mt-2" placeholder="Logistics — e.g. Manali → Rohtang | 51km | 2.5 hrs | by SUV"
                    value={d.logistics ?? ""} onChange={(e) => updateDay(i, { logistics: e.target.value })} />
                  <div className="mt-2">
                    <ImageUploader bucket="tours" value={d.image ?? null}
                      onChange={(url) => updateDay(i, { image: url })} label="Photo for this day (optional)" />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* SMART ADD-ONS */}
          <Section title="Smart Add-ons" hint="Trip-specific optional extras (e.g. Snow boots rental, Rafting). Travellers can toggle these on the detail page.">
            <Repeater
              items={smartAddons}
              onChange={setSmartAddons}
              empty={() => ({ name: "", price: 0, description: "" })}
              render={(it, update) => (
                <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
                  <Input placeholder="Add-on name, e.g. Rent snow boots" value={it.name} onChange={(e) => update({ name: e.target.value })} />
                  <Input type="number" placeholder="Price ₹" value={it.price} onChange={(e) => update({ price: Number(e.target.value) || 0 })} />
                  <Textarea rows={2} className="sm:col-span-2" placeholder="Short description (optional)"
                    value={it.description ?? ""} onChange={(e) => update({ description: e.target.value })} />
                </div>
              )}
            />
          </Section>

          {/* DESTINATION HIGHLIGHTS */}
          <Section title="Destination Deep-Dive" hint="Places covered, interesting facts, must-try food and key activities.">
            <Repeater
              items={highlights}
              onChange={setHighlights}
              empty={() => ({ place: "", fact: "", food: "", activities: "", image: null })}
              render={(it, update) => (
                <div className="space-y-2">
                  <Input placeholder="Place, e.g. Shimla" value={it.place} onChange={(e) => update({ place: e.target.value })} />
                  <Textarea rows={2} placeholder="Interesting fact / story" value={it.fact ?? ""} onChange={(e) => update({ fact: e.target.value })} />
                  <Input placeholder="Must-try food (comma separated)" value={it.food ?? ""} onChange={(e) => update({ food: e.target.value })} />
                  <Input placeholder="Top activities (comma separated)" value={it.activities ?? ""} onChange={(e) => update({ activities: e.target.value })} />
                  <ImageUploader bucket="tours" value={it.image ?? null} onChange={(url) => update({ image: url })} label="Photo (optional)" />
                </div>
              )}
            />
          </Section>

          {/* TRIP FAQs */}
          <Section title="Trip-Specific FAQs" hint="Shown as an accordion at the bottom of this tour's detail page.">
            <Repeater
              items={tripFaqs}
              onChange={setTripFaqs}
              empty={() => ({ question: "", answer: "" })}
              render={(it, update) => (
                <div className="space-y-2">
                  <Input placeholder="Question" value={it.question} onChange={(e) => update({ question: e.target.value })} />
                  <Textarea rows={3} placeholder="Answer" value={it.answer} onChange={(e) => update({ answer: e.target.value })} />
                </div>
              )}
            />
          </Section>

          <div className="mt-4 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(form.featured)}
                onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4" />
              Featured on home page
            </label>
            <div className="flex items-center gap-2 text-sm">
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="rounded-md border bg-background px-2 py-1">
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (live)</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border p-3">
      <div className="mb-2">
        <Label className="text-sm font-semibold">{title}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Repeater<T>({
  items,
  onChange,
  empty,
  render,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  empty: () => T;
  render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const add = () => onChange([...items, empty()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="relative rounded-md border bg-muted/30 p-3">
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {render(it, (patch) => update(i, patch))}
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add}>
        <Plus className="mr-1 h-4 w-4" /> Add
      </Button>
    </div>
  );
}

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
