import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

type Spot = { key: string; name: string; emoji: string; x: number; y: number };

// Approximate positions (%) over the India map image
const SPOTS: Spot[] = [
  { key: "kashmir", name: "Kashmir", emoji: "🏔️", x: 30, y: 12 },
  { key: "ladakh", name: "Ladakh", emoji: "🛕", x: 40, y: 16 },
  { key: "spiti", name: "Spiti", emoji: "⛰️", x: 38, y: 23 },
  { key: "manali", name: "Manali", emoji: "🌲", x: 35, y: 26 },
  { key: "goa", name: "Goa", emoji: "🏖️", x: 30, y: 70 },
  { key: "kerala", name: "Kerala", emoji: "🌴", x: 37, y: 88 },
];

const MAP_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/India_administrative_divisions_blank.svg/640px-India_administrative_divisions_blank.svg.png";

export function IndiaMap() {
  const navigate = useNavigate();
  const [tourByDest, setTourByDest] = useState<Record<string, string>>({});
  const [active, setActive] = useState<Spot | null>(null);

  useEffect(() => {
    supabase
      .from("tours")
      .select("slug,destination")
      .eq("status", "published")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data ?? []).forEach((t: any) => {
          if (t.destination) map[t.destination.toLowerCase()] = t.slug;
        });
        setTourByDest(map);
      });
  }, []);

  const go = (spot: Spot) => {
    const slug = Object.entries(tourByDest).find(([d]) => d.includes(spot.key))?.[1];
    if (slug) navigate({ to: "/tours/$slug", params: { slug } });
    else navigate({ to: "/tours" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <Reveal className="mb-10 text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-secondary">Explore the Map</span>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Tap a Destination on India</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Click any glowing pin to open its curated packages.
        </p>
      </Reveal>

      <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
            <img src={MAP_IMG} alt="Map of India" className="size-full object-contain opacity-80 dark:invert" />
            {SPOTS.map((s) => {
              const hasTour = Object.keys(tourByDest).some((d) => d.includes(s.key));
              return (
                <button
                  key={s.key}
                  onClick={() => go(s)}
                  onMouseEnter={() => setActive(s)}
                  onMouseLeave={() => setActive(null)}
                  style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  aria-label={s.name}
                >
                  <span className="relative flex size-4">
                    <span className={`absolute inline-flex size-full animate-ping rounded-full ${hasTour ? "bg-primary/60" : "bg-secondary/50"}`} />
                    <span className={`relative inline-flex size-4 items-center justify-center rounded-full text-[8px] ${hasTour ? "bg-primary" : "bg-secondary"} text-white shadow-lg`}>
                      <MapPin className="size-2.5" />
                    </span>
                  </span>
                  <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold opacity-0 shadow transition group-hover:opacity-100">
                    {s.emoji} {s.name}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 gap-3">
            {SPOTS.map((s) => {
              const hasTour = Object.keys(tourByDest).some((d) => d.includes(s.key));
              return (
                <motion.button
                  key={s.key}
                  whileHover={{ y: -3 }}
                  onClick={() => go(s)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                    active?.key === s.key ? "border-primary bg-primary/5" : "bg-card"
                  }`}
                >
                  <span>
                    <span className="font-display text-lg font-semibold">{s.emoji} {s.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {hasTour ? "Packages available" : "Enquire now"}
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-primary" />
                </motion.button>
              );
            })}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-secondary" /> Pins in blue have live packages ready to book.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
