import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  title: string;
  subtitle: string | null;
  season: string | null;
  banner_image: string | null;
  display_order: number;
  display_start: string | null;
  display_end: string | null;
  tour_id: string | null;
  tour?: { slug: string } | null;
};

export function SeasonalTours() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("seasonal_collections")
      .select("id,title,subtitle,season,banner_image,display_order,display_start,display_end,tour_id,tour:tours(slug)")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        const all = ((data as any[]) ?? []) as Row[];
        const live = all.filter((r) => {
          if (r.display_start && r.display_start > today) return false;
          if (r.display_end && r.display_end < today) return false;
          return true;
        });
        setRows(live);
      });
  }, []);

  if (rows.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-secondary">
            <Sparkles className="size-4" /> In Season
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Trending Right Now</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Handpicked seasonal escapes — curated for this exact moment of the year.
          </p>
        </div>
        <Link
          to="/tours"
          className="inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent"
        >
          All trips <ArrowRight className="size-4" />
        </Link>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((r, i) => {
          const target = r.tour?.slug
            ? { to: "/tours/$slug" as const, params: { slug: r.tour.slug } }
            : { to: "/tours" as const };
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                {...target}
                className="group relative block h-72 overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:shadow-xl"
              >
                <img
                  src={r.banner_image ?? ""}
                  alt={r.title}
                  loading="lazy"
                  className="size-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                {r.season && (
                  <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground backdrop-blur">
                    {r.season}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="font-display text-xl font-bold leading-tight">{r.title}</h3>
                  {r.subtitle && <p className="mt-1 line-clamp-2 text-sm text-white/85">{r.subtitle}</p>}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white transition-transform group-hover:translate-x-1">
                    Explore <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
