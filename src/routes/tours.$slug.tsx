import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Users, CalendarDays, Mountain, Check, X, Minus, Plus,
  ArrowLeft, MessageCircle, ChevronDown, Backpack, HelpCircle, ArrowRight, Image as ImageIcon,
} from "lucide-react";
import { pageHead } from "@/lib/page-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, waLink } from "@/lib/brand";
import { inr } from "@/routes/tours.index";
import { BookingModal } from "@/components/tours/BookingModal";
import { Lightbox } from "@/components/tours/Lightbox";

export const Route = createFileRoute("/tours/$slug")({
  head: () => pageHead("Tour Details", "Immersive day-by-day itinerary, pricing & booking for your next adventure."),
  component: TourDetails,
});

type ItineraryDay = { day: number; title: string; details: string; image?: string | null; logistics?: string };
type SmartAddon = { name: string; price: number; description?: string };
type DestinationHighlight = { place: string; fact?: string; food?: string; activities?: string; image?: string | null };
type TripFaq = { question: string; answer: string };
type Tour = {
  id: string; title: string; slug: string; destination: string | null; vibe: string | null;
  group_type: string | null; description: string | null; short_description: string | null;
  itinerary: ItineraryDay[] | null; duration: string | null; price: number | null;
  inclusions: string[] | null; exclusions: string[] | null; group_size: number | null;
  seats_available: number | null; best_season: string | null; difficulty: string | null;
  hero_image: string | null; gallery_images: string[] | null; departure_dates: string[] | null;
  property_images: string[] | null;
  smart_addons: SmartAddon[] | null;
  destination_highlights: DestinationHighlight[] | null;
  best_months_label: string | null;
  best_months_description: string | null;
  trip_faqs: TripFaq[] | null;
};
type Addon = { id: string; name: string; description: string | null; price: number; required: boolean };
type Faq = { id: string; question: string; answer: string | null };
type RelatedTour = { id: string; slug: string; title: string; destination: string | null; price: number | null; duration: string | null; hero_image: string | null };

// Static fallback add-ons (used only if no DB add-ons configured)
const FALLBACK_ADDONS: Addon[] = [
  { id: "insurance", name: "Travel Insurance", description: null, price: 999, required: false },
  { id: "photography", name: "Pro Photography", description: null, price: 2499, required: false },
  { id: "singleroom", name: "Private Room Upgrade", description: null, price: 3999, required: false },
];

function buildPackingList(t: Tour): { category: string; items: string[] }[] {
  const cold = /winter|snow|spiti|ladakh|kashmir|manali|himalay/i.test(`${t.destination ?? ""} ${t.best_season ?? ""} ${t.title}`);
  const beach = /beach|goa|kerala|andaman|backwater/i.test(`${t.destination ?? ""} ${t.title}`);
  const trek = /trek|adventure|expedition|hard|moderate/i.test(`${t.difficulty ?? ""} ${t.vibe ?? ""}`);
  const list = [
    { category: "Essentials", items: ["Photo ID + photocopy", "Cash + 1–2 cards", "Power bank & chargers", "Reusable water bottle", "Personal medicines"] },
    { category: "Clothing", items: cold
      ? ["Heavy down/winter jacket", "Thermal innerwear (2 sets)", "Woollen cap, gloves, scarf", "Waterproof trekking boots", "Wool socks (3–4 pairs)"]
      : beach
        ? ["Light cotton clothes", "Swimwear + quick-dry towel", "Flip-flops + walking shoes", "Sun hat & sunglasses", "Light jacket for evenings"]
        : ["Comfortable trousers/jeans", "T-shirts + 1 warm layer", "Walking shoes", "Sleepwear", "Light raincoat/poncho"] },
    { category: "Health & Safety", items: ["Sunscreen SPF 50+", "Lip balm & moisturizer", "Basic first-aid kit", "Hand sanitizer & wipes", ...(cold ? ["Diamox/altitude meds (consult doctor)"] : []), ...(trek ? ["Knee braces (if needed)"] : [])] },
    { category: "Smart Extras", items: ["Day backpack", "Refillable snacks", "Plug adapter", "Earphones", ...(trek ? ["Trekking poles", "Headlamp/torch"] : ["Book / playlist"])] },
  ];
  return list;
}

function TourDetails() {
  const { slug } = useParams({ from: "/tours/$slug" });
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [addonsAvailable, setAddonsAvailable] = useState<Addon[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [related, setRelated] = useState<RelatedTour[]>([]);

  const [travelers, setTravelers] = useState(2);
  const [departureDate, setDepartureDate] = useState("");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("tours").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      if (!active) return;
      const t = data as Tour | null;
      setTour(t);
      if (t?.departure_dates?.length) setDepartureDate(t.departure_dates[0]);

      if (t) {
        const [{ data: ad }, { data: fq }, { data: rel }] = await Promise.all([
          supabase.from("tour_addons").select("id,name,description,price,required").eq("tour_id", t.id).order("display_order", { ascending: true }),
          supabase.from("faq").select("id,question,answer").eq("tour_id", t.id).order("display_order", { ascending: true }),
          supabase.from("tours").select("id,slug,title,destination,price,duration,hero_image")
            .eq("status", "published").neq("id", t.id)
            .or(`destination.eq.${t.destination ?? ""},vibe.eq.${t.vibe ?? ""}`).limit(3),
        ]);
        if (!active) return;
        const a = (ad as Addon[]) ?? [];
        setAddonsAvailable(a.length ? a : FALLBACK_ADDONS);
        setSelectedAddonIds(a.filter((x) => x.required).map((x) => x.id));
        setFaqs(((fq as Faq[]) ?? []));
        if (fq && fq.length > 0) setOpenFaq((fq[0] as Faq).id);
        setRelated((rel as RelatedTour[]) ?? []);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug]);

  const addonTotal = useMemo(
    () => selectedAddonIds.reduce((sum, id) => sum + (addonsAvailable.find((a) => a.id === id)?.price ?? 0), 0),
    [selectedAddonIds, addonsAvailable],
  );
  const base = (tour?.price ?? 0) * travelers;
  const total = base + addonTotal * travelers;

  const toggleAddon = (a: Addon) => {
    if (a.required) return;
    setSelectedAddonIds((prev) => (prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id]));
  };

  if (loading) {
    return <main className="mx-auto max-w-6xl px-4 pb-24 pt-32"><div className="h-80 animate-pulse rounded-3xl bg-muted" /></main>;
  }

  if (!tour) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-32 text-center">
        <h1 className="font-display text-3xl font-bold">Tour not found</h1>
        <p className="mt-3 text-muted-foreground">This expedition may have ended or moved.</p>
        <Button asChild className="mt-6"><Link to="/tours">Browse all tours</Link></Button>
      </main>
    );
  }

  const gallery = tour.gallery_images ?? [];
  const packing = buildPackingList(tour);

  return (
    <main className="pb-24">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
        <img src={tour.hero_image ?? ""} alt={tour.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 text-white">
          <Link to="/tours" className="mb-4 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All tours
          </Link>
          <div className="flex flex-wrap gap-2">
            {tour.vibe && <Badge variant="secondary">{tour.vibe}</Badge>}
            {tour.difficulty && <Badge variant="secondary">{tour.difficulty}</Badge>}
            {tour.group_type && <Badge variant="secondary">{tour.group_type}</Badge>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">{tour.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-white/85"><MapPin className="h-4 w-4" /> {tour.destination}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 lg:grid-cols-[1fr_360px]">
        {/* Left: content */}
        <div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Clock, label: tour.duration },
              { icon: Users, label: tour.group_size ? `Max ${tour.group_size}` : null },
              { icon: CalendarDays, label: tour.best_season },
              { icon: Mountain, label: tour.difficulty },
            ].filter((s) => s.label).map((s, i) => (
              <div key={i} className="rounded-xl border bg-card p-3 text-center">
                <s.icon className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-1 text-xs font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <Reveal>
            <h2 className="mt-10 font-display text-2xl font-bold">Overview</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{tour.description}</p>
          </Reveal>

          {/* Itinerary */}
          {tour.itinerary && tour.itinerary.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-bold">Day-by-Day Itinerary</h2>
              <ol className="mt-6 space-y-0 border-l-2 border-dashed border-primary/30 pl-6">
                {tour.itinerary.map((d, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="relative pb-8 last:pb-0">
                    <span className="absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {d.day}
                    </span>
                    <h3 className="font-semibold">{d.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{d.details}</p>
                  </motion.li>
                ))}
              </ol>
            </div>
          )}

          {/* Inclusions / Exclusions */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {tour.inclusions && tour.inclusions.length > 0 && (
              <div className="rounded-2xl border bg-card p-5">
                <h3 className="font-display text-lg font-semibold">What's Included</h3>
                <ul className="mt-3 space-y-2">
                  {tour.inclusions.map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tour.exclusions && tour.exclusions.length > 0 && (
              <div className="rounded-2xl border bg-card p-5">
                <h3 className="font-display text-lg font-semibold">Not Included</h3>
                <ul className="mt-3 space-y-2">
                  {tour.exclusions.map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Packing list */}
          <div className="mt-10">
            <div className="flex items-center gap-2">
              <Backpack className="size-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Smart Packing List</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Curated for the destination, weather, and difficulty of this trip.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {packing.map((p) => (
                <div key={p.category} className="rounded-2xl border bg-card p-5">
                  <h3 className="font-display text-base font-semibold">{p.category}</h3>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {p.items.map((it) => (
                      <li key={it} className="flex items-start gap-2">
                        <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery with lightbox */}
          {gallery.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-5 text-primary" />
                <h2 className="font-display text-2xl font-bold">Gallery</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(i)}
                    className="group relative overflow-hidden rounded-xl"
                  >
                    <img
                      src={img}
                      alt={`${tour.title} ${i + 1}`}
                      loading="lazy"
                      className="h-40 w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {faqs.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-5 text-primary" />
                <h2 className="font-display text-2xl font-bold">Trip FAQs</h2>
              </div>
              <div className="mt-4 space-y-3">
                {faqs.map((f) => {
                  const isOpen = openFaq === f.id;
                  return (
                    <div key={f.id} className="overflow-hidden rounded-2xl border bg-card">
                      <button onClick={() => setOpenFaq(isOpen ? null : f.id)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                        <span className="font-medium">{f.question}</span>
                        <ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <p className="whitespace-pre-wrap px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <Link to="/faq" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Browse all FAQs <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}

          {/* Related tours */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-2xl font-bold">You may also like</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.id} to="/tours/$slug" params={{ slug: r.slug }}
                    className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    {r.hero_image && (
                      <div className="h-40 overflow-hidden">
                        <img src={r.hero_image} alt={r.title} loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" /> {r.destination}</p>
                      <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold">{r.title}</h3>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{r.duration}</span>
                        <span className="font-display font-bold text-primary">{inr(r.price ?? 0)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: pricing calculator */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-lg">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="font-display text-3xl font-bold text-primary">{inr(tour.price ?? 0)}</p>
            <p className="text-xs text-muted-foreground">per person</p>

            <div className="mt-5">
              <label className="text-sm font-medium">Travellers</label>
              <div className="mt-2 flex items-center justify-between rounded-lg border p-1">
                <Button variant="ghost" size="icon" onClick={() => setTravelers((t) => Math.max(1, t - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="font-semibold">{travelers}</span>
                <Button variant="ghost" size="icon" onClick={() => setTravelers((t) => Math.min(tour.group_size ?? 20, t + 1))}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {tour.departure_dates && tour.departure_dates.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium">Departure date</label>
                <select value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  {tour.departure_dates.map((d) => (
                    <option key={d} value={d}>{new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</option>
                  ))}
                </select>
              </div>
            )}

            {addonsAvailable.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium">Add-ons (per person)</label>
                <div className="mt-2 space-y-2">
                  {addonsAvailable.map((a) => {
                    const checked = selectedAddonIds.includes(a.id);
                    return (
                      <label key={a.id} className={`flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-2.5 text-sm ${a.required ? "bg-primary/5" : ""}`}>
                        <span className="flex flex-1 items-start gap-2">
                          <input type="checkbox" checked={checked} disabled={a.required}
                            onChange={() => toggleAddon(a)} className="mt-0.5 h-4 w-4 accent-[var(--primary)]" />
                          <span>
                            <span className="font-medium">{a.name}</span>
                            {a.required && <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Included</span>}
                            {a.description && <span className="block text-[11px] text-muted-foreground">{a.description}</span>}
                          </span>
                        </span>
                        <span className="shrink-0 text-muted-foreground">+{inr(a.price)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 space-y-1 border-t pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{inr(tour.price ?? 0)} × {travelers}</span>
                <span>{inr(base)}</span>
              </div>
              {addonTotal > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Add-ons × {travelers}</span>
                  <span>{inr(addonTotal * travelers)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">{inr(total)}</span>
              </div>
            </div>

            <Button className="mt-4 w-full" size="lg" onClick={() => setBookingOpen(true)}>Book Now</Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <a href={waLink(`Hi ${BRAND.name}! I'm interested in the ${tour.title} tour.`)} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Ask on WhatsApp
              </a>
            </Button>
          </div>
        </aside>
      </div>

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        tour={{ id: tour.id, title: tour.title, price: tour.price ?? 0, departure_dates: tour.departure_dates }}
        travelers={travelers}
        departureDate={departureDate}
        addons={selectedAddonIds.map((id) => addonsAvailable.find((a) => a.id === id)?.name ?? id)}
        total={total}
      />

      <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />
    </main>
  );
}
