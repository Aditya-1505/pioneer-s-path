import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, Play, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

type Testimonial = {
  id: string;
  customer_name: string;
  rating: number | null;
  review: string | null;
  trip_name: string | null;
  photo_url: string | null;
  video_url: string | null;
};

const FALLBACK: Testimonial[] = [
  { id: "1", customer_name: "Ananya & Rohit", rating: 5, review: "Our Spiti road trip was flawless — every stay, every meal sorted. We just showed up and made memories!", trip_name: "Spiti Valley", photo_url: null, video_url: null },
  { id: "2", customer_name: "The Mehta Family", rating: 5, review: "Travelling with kids felt effortless. The coordinators were patient, fun and super organized.", trip_name: "Kerala", photo_url: null, video_url: null },
  { id: "3", customer_name: "Priya S.", rating: 5, review: "My solo Kashmir trip felt safe and luxurious. Worth every rupee. Highly recommend Pioneer!", trip_name: "Kashmir", photo_url: null, video_url: null },
  { id: "4", customer_name: "Karan & Friends", rating: 5, review: "Manali with the gang was unforgettable. Zero planning stress, all party. 10/10!", trip_name: "Manali", photo_url: null, video_url: null },
  { id: "5", customer_name: "Sneha R.", rating: 5, review: "Goa was perfectly paced — beaches, cafes and the right amount of chaos. Loved it.", trip_name: "Goa", photo_url: null, video_url: null },
  { id: "6", customer_name: "Vivek & Meera", rating: 5, review: "Our anniversary surprise trip left us speechless. They thought of every little detail.", trip_name: "Surprise Trip", photo_url: null, video_url: null },
];

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id,customer_name,rating,review,trip_name,photo_url,video_url")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as Testimonial[]) ?? []));
  }, []);

  const list = items.length ? items : FALLBACK;
  const videos = list.filter((t) => t.video_url);
  const text = list.filter((t) => !t.video_url);

  return (
    <section className="bg-muted/40 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-secondary">Wall of Love</span>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Travellers Who Trusted Us</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Real stories from {list.length}+ travellers across our expeditions.
          </p>
        </Reveal>

        {videos.length > 0 && <VideoCarousel videos={videos} />}

        <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {text.map((t, i) => (
            <Reveal key={t.id} delay={(i % 6) * 0.05}>
              <figure className="break-inside-avoid rounded-3xl border bg-card p-6 shadow-sm">
                <Quote className="size-7 text-secondary/40" />
                <div className="mt-3 flex gap-0.5 text-sand">
                  {Array.from({ length: t.rating ?? 5 }).map((_, j) => (
                    <Star key={j} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
                  “{t.review}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.customer_name} className="size-9 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-9 place-items-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                      {t.customer_name.charAt(0)}
                    </span>
                  )}
                  <span className="text-sm font-semibold">
                    {t.customer_name}
                    <span className="block font-normal text-muted-foreground">{t.trip_name}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoCarousel({ videos }: { videos: Testimonial[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) =>
    ref.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Play className="size-5 text-primary" /> Video Reviews
        </h3>
        <div className="hidden gap-2 sm:flex">
          <button onClick={() => scroll(-1)} className="grid size-9 place-items-center rounded-full border bg-card hover:bg-accent">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => scroll(1)} className="grid size-9 place-items-center rounded-full border bg-card hover:bg-accent">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex snap-x gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {videos.map((t) => (
          <motion.div
            key={t.id}
            whileHover={{ y: -4 }}
            className="w-[320px] shrink-0 snap-start overflow-hidden rounded-3xl border bg-card shadow-sm"
          >
            <video
              src={t.video_url!}
              poster={t.photo_url ?? undefined}
              controls
              preload="metadata"
              className="h-56 w-full bg-black object-cover"
            />
            <div className="p-4">
              <div className="flex gap-0.5 text-sand">
                {Array.from({ length: t.rating ?? 5 }).map((_, j) => (
                  <Star key={j} className="size-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-2 text-sm font-semibold">
                {t.customer_name}
                <span className="font-normal text-muted-foreground"> · {t.trip_name}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
