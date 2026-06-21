import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Clock, ArrowRight, Flame, Sparkles, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MONTHS } from "@/lib/brand";

type Tour = {
  id: string;
  title: string;
  slug: string;
  destination: string | null;
  duration: string | null;
  price: number | null;
  hero_image: string | null;
  featured: boolean | null;
  best_season: string | null;
  best_months_label: string | null;
  created_at: string;
};

type Tab = "featured" | "trending" | "season";

const TABS: { id: Tab; label: string; icon: typeof Flame }[] = [
  { id: "featured", label: "Featured", icon: Sparkles },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "season", label: "In Season", icon: Sun },
];

export function JourneyExplorer() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [active, setActive] = useState<Tab>("featured");

  useEffect(() => {
    supabase
      .from("tours")
      .select("id,title,slug,destination,duration,price,hero_image,featured,best_season,best_months_label,created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(40)
      .then(({ data }) => setTours((data as Tour[]) ?? []));
  }, []);

  const currentMonth = MONTHS[new Date().getMonth()];

  const filtered = useMemo(() => {
    if (active === "featured") {
      return tours.filter((t) => t.featured).slice(0, 6);
    }
    if (active === "trending") {
      // Newest 6 as a stand-in for "trending"
      return [...tours].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6);
    }
    // In Season — match current month in best_season or best_months_label
    const rx = new RegExp(currentMonth, "i");
    const inSeason = tours.filter((t) => rx.test(`${t.best_season ?? ""} ${t.best_months_label ?? ""}`));
    return (inSeason.length ? inSeason : tours).slice(0, 6);
  }, [tours, active, currentMonth]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-secondary">
            Find Your Next Journey
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">
            Curated Trips, Updated Weekly
          </h2>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/tours">
            View all <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Reveal>

      {/* Tabs */}
      <div className="mb-8 inline-flex rounded-full border bg-card p-1 shadow-sm">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="journey-tab"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="size-4" /> {t.label}
                {t.id === "season" && isActive && (
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{currentMonth}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border bg-muted/30 p-10 text-center text-muted-foreground">
          No trips in this category yet — check back soon!
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.06}>
              <Link
                to="/tours/$slug"
                params={{ slug: t.slug }}
                className="group block overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:shadow-[var(--shadow-card)]"
              >
                <div className="relative h-52 overflow-hidden">
                  {t.hero_image ? (
                    <img
                      src={t.hero_image}
                      alt={t.title}
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                  )}
                  {active === "featured" && t.featured && (
                    <span className="absolute left-3 top-3 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-sand-foreground">
                      Featured
                    </span>
                  )}
                  {active === "season" && (
                    <span className="absolute left-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                      In Season
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {t.destination}
                  </div>
                  <h3 className="mt-1 font-display text-xl font-semibold">{t.title}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="size-4" /> {t.duration}
                    </span>
                    <span className="font-display text-lg font-bold text-primary">
                      ₹{(t.price ?? 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
