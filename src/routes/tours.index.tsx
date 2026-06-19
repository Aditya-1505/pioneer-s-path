import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, ArrowRight, Search, Star } from "lucide-react";
import { pageHead } from "@/lib/page-helpers";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/tours/")({
  head: () =>
    pageHead(
      "Tours",
      "Explore curated tour packages across Manali, Spiti, Kerala, Goa, Kashmir & Ladakh.",
    ),
  component: ToursExplorer,
});

export type TourCard = {
  id: string;
  title: string;
  slug: string;
  destination: string | null;
  vibe: string | null;
  duration: string | null;
  price: number | null;
  hero_image: string | null;
  difficulty: string | null;
  featured: boolean | null;
  short_description: string | null;
  seats_available: number | null;
};

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

function ToursExplorer() {
  const [tours, setTours] = useState<TourCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [vibe, setVibe] = useState<string>("All");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");

  useEffect(() => {
    supabase
      .from("tours")
      .select(
        "id,title,slug,destination,vibe,duration,price,hero_image,difficulty,featured,short_description,seats_available",
      )
      .eq("status", "published")
      .order("featured", { ascending: false })
      .then(({ data }) => {
        setTours((data as TourCard[]) ?? []);
        setLoading(false);
      });
  }, []);

  const vibes = useMemo(
    () => ["All", ...Array.from(new Set(tours.map((t) => t.vibe).filter(Boolean) as string[]))],
    [tours],
  );

  const filtered = useMemo(() => {
    let list = tours.filter((t) => {
      const matchQ =
        !q ||
        `${t.title} ${t.destination ?? ""}`.toLowerCase().includes(q.toLowerCase());
      const matchVibe = vibe === "All" || t.vibe === vibe;
      return matchQ && matchVibe;
    });
    if (sort === "low") list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === "high") list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return list;
  }, [tours, q, vibe, sort]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:pt-32">
      <Reveal>
        <div className="text-center">
          <p className="font-medium uppercase tracking-[0.2em] text-primary">Our Expeditions</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Find Your Next Journey</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Hand-crafted itineraries across India's most loved destinations — comfortable stays,
            trusted coordinators, and unforgettable memories.
          </p>
        </div>
      </Reveal>

      {/* Filters */}
      <div className="mt-10 flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search destinations or tours..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {vibes.map((v) => (
            <button
              key={v}
              onClick={() => setVibe(v)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                vibe === v
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="featured">Featured</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">No tours match your filters yet.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.08 }}
            >
              <Link
                to="/tours/$slug"
                params={{ slug: t.slug }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={t.hero_image ?? ""}
                    alt={t.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {t.featured && (
                    <Badge className="absolute left-3 top-3 gap-1">
                      <Star className="h-3 w-3" /> Featured
                    </Badge>
                  )}
                  {t.difficulty && (
                    <span className="absolute right-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium backdrop-blur">
                      {t.difficulty}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {t.destination}
                  </div>
                  <h3 className="mt-1 font-display text-xl font-semibold leading-snug">{t.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {t.short_description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    {t.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {t.duration}
                      </span>
                    )}
                    {t.seats_available != null && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {t.seats_available} seats
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex items-end justify-between border-t pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-display text-xl font-bold text-primary">
                        {inr(t.price ?? 0)}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
                      View <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
