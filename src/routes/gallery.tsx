import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, ImageOff } from "lucide-react";
import { pageHead, PageHero } from "@/lib/page-helpers";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/gallery")({
  head: () => pageHead("Gallery", "A showcase of photos & videos from The Pioneer Tours expeditions."),
  component: GalleryPage,
});

type Item = {
  id: string;
  title: string | null;
  destination: string | null;
  image_url: string | null;
  video_url: string | null;
  category: string | null;
  location_tag: string | null;
};

function GalleryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState("All");

  useEffect(() => {
    (supabase.from("gallery") as any)
      .select("id,title,destination,image_url,video_url,category,location_tag")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: unknown }) => {
        setItems((data as Item[]) ?? []);
        setLoading(false);
      });
  }, []);

  const tags = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.location_tag || i.destination || i.category).filter(Boolean) as string[]))],
    [items],
  );
  const filtered = items.filter(
    (i) => tag === "All" || i.location_tag === tag || i.destination === tag || i.category === tag,
  );

  return (
    <main>
      <PageHero
        eyebrow="Memories"
        title="Our Gallery"
        subtitle="Real moments from real journeys — captured across mountains, beaches and valleys."
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="mb-4 h-64 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <ImageOff className="size-10" />
            <p>No media here yet.</p>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {filtered.map((it, i) => (
              <motion.figure
                key={it.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.06 }}
                className="group relative break-inside-avoid overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                {it.video_url ? (
                  <div
                    className="relative cursor-pointer"
                    onMouseEnter={(e) => {
                      const v = e.currentTarget.querySelector("video");
                      v?.play().catch(() => {});
                    }}
                    onMouseLeave={(e) => {
                      const v = e.currentTarget.querySelector("video");
                      if (v) { v.pause(); v.currentTime = 0; }
                    }}
                  >
                    <video
                      src={it.video_url}
                      poster={it.image_url ?? undefined}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      controls
                      className="w-full bg-black object-cover"
                    />
                    <div className="pointer-events-none absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/90 text-primary shadow">
                      <Play className="size-4" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={it.image_url ?? ""}
                    alt={it.title ?? "Gallery photo"}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                {(it.title || it.destination) && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-4 text-background opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="font-display text-lg font-semibold">{it.title}</p>
                    {it.destination && <p className="text-sm">{it.destination}</p>}
                  </figcaption>
                )}
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
