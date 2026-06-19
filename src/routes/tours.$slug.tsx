import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Users,
  CalendarDays,
  Mountain,
  Check,
  X,
  Minus,
  Plus,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { pageHead } from "@/lib/page-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, waLink } from "@/lib/brand";
import { inr } from "@/routes/tours.index";
import { BookingModal } from "@/components/tours/BookingModal";

export const Route = createFileRoute("/tours/$slug")({
  head: () =>
    pageHead("Tour Details", "Immersive day-by-day itinerary, pricing & booking for your next adventure."),
  component: TourDetails,
});

type ItineraryDay = { day: number; title: string; details: string };
type Tour = {
  id: string;
  title: string;
  slug: string;
  destination: string | null;
  vibe: string | null;
  group_type: string | null;
  description: string | null;
  short_description: string | null;
  itinerary: ItineraryDay[] | null;
  duration: string | null;
  price: number | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  group_size: number | null;
  seats_available: number | null;
  best_season: string | null;
  difficulty: string | null;
  hero_image: string | null;
  gallery_images: string[] | null;
  departure_dates: string[] | null;
};

const ADDONS = [
  { id: "insurance", label: "Travel Insurance", price: 999 },
  { id: "photography", label: "Pro Photography", price: 2499 },
  { id: "singleroom", label: "Private Room Upgrade", price: 3999 },
];

function TourDetails() {
  const { slug } = useParams({ from: "/tours/$slug" });
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  const [travelers, setTravelers] = useState(2);
  const [departureDate, setDepartureDate] = useState("");
  const [addons, setAddons] = useState<string[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("tours")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        const t = data as Tour | null;
        setTour(t);
        if (t?.departure_dates?.length) setDepartureDate(t.departure_dates[0]);
        setLoading(false);
      });
  }, [slug]);

  const addonTotal = useMemo(
    () =>
      addons.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0),
    [addons],
  );
  const base = (tour?.price ?? 0) * travelers;
  const total = base + addonTotal * travelers;

  const toggleAddon = (id: string) =>
    setAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-32">
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
      </main>
    );
  }

  if (!tour) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-32 text-center">
        <h1 className="font-display text-3xl font-bold">Tour not found</h1>
        <p className="mt-3 text-muted-foreground">This expedition may have ended or moved.</p>
        <Button asChild className="mt-6">
          <Link to="/tours">Browse all tours</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="pb-24">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
        <img src={tour.hero_image ?? ""} alt={tour.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 text-white">
          <Link
            to="/tours"
            className="mb-4 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All tours
          </Link>
          <div className="flex flex-wrap gap-2">
            {tour.vibe && <Badge variant="secondary">{tour.vibe}</Badge>}
            {tour.difficulty && <Badge variant="secondary">{tour.difficulty}</Badge>}
            {tour.group_type && <Badge variant="secondary">{tour.group_type}</Badge>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">{tour.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-white/85">
            <MapPin className="h-4 w-4" /> {tour.destination}
          </p>
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
            ]
              .filter((s) => s.label)
              .map((s, i) => (
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
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pb-8 last:pb-0"
                  >
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

          {/* Gallery */}
          {tour.gallery_images && tour.gallery_images.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-bold">Gallery</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {tour.gallery_images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${tour.title} ${i + 1}`}
                    loading="lazy"
                    className="h-40 w-full rounded-xl object-cover"
                  />
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

            {/* Travelers */}
            <div className="mt-5">
              <label className="text-sm font-medium">Travellers</label>
              <div className="mt-2 flex items-center justify-between rounded-lg border p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold">{travelers}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTravelers((t) => Math.min(tour.group_size ?? 20, t + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Departure */}
            {tour.departure_dates && tour.departure_dates.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium">Departure date</label>
                <select
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  {tour.departure_dates.map((d) => (
                    <option key={d} value={d}>
                      {new Date(d).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Add-ons */}
            <div className="mt-4">
              <label className="text-sm font-medium">Add-ons (per person)</label>
              <div className="mt-2 space-y-2">
                {ADDONS.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addons.includes(a.id)}
                        onChange={() => toggleAddon(a.id)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      {a.label}
                    </span>
                    <span className="text-muted-foreground">+{inr(a.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="mt-5 space-y-1 border-t pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {inr(tour.price ?? 0)} × {travelers}
                </span>
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

            <Button className="mt-4 w-full" size="lg" onClick={() => setBookingOpen(true)}>
              Book Now
            </Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <a
                href={waLink(`Hi ${BRAND.name}! I'm interested in the ${tour.title} tour.`)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Ask on WhatsApp
              </a>
            </Button>
          </div>
        </aside>
      </div>

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        tour={{
          id: tour.id,
          title: tour.title,
          price: tour.price ?? 0,
          departure_dates: tour.departure_dates,
        }}
        travelers={travelers}
        departureDate={departureDate}
        addons={addons.map((id) => ADDONS.find((a) => a.id === id)?.label ?? id)}
        total={total}
      />
    </main>
  );
}
