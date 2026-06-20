import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const PHOTOS = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=700&q=75",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=75",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=700&q=75",
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=700&q=75",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=700&q=75",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=75",
];

const QUOTES = [
  { q: "The journey of a thousand miles begins with one step.", a: "Lao Tzu" },
  { q: "Travel makes one modest. You see what a tiny place you occupy in the world.", a: "Gustave Flaubert" },
  { q: "We travel not to escape life, but for life not to escape us.", a: "Anonymous" },
  { q: "Adventure may hurt you, but monotony will kill you.", a: "Marcus Purvis" },
  { q: "To travel is to live.", a: "Hans Christian Andersen" },
];

export function FloatingPhotos() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 5200);
    return () => clearInterval(t);
  }, []);
  const current = QUOTES[idx];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/5 to-background py-24">
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute left-[10%] top-10 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[8%] bottom-10 size-80 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <Reveal className="mx-auto max-w-2xl px-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
          ✦ Wanderlust ✦
        </span>
        <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-5xl">
          Whispers from the road.
        </h2>
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 items-center gap-10 px-4 md:grid-cols-[1fr_1.4fr_1fr]">
        {/* Left photo column */}
        <div className="hidden flex-col gap-5 md:flex">
          {PHOTOS.slice(0, 2).map((src, i) => (
            <motion.img
              key={i}
              src={src}
              alt=""
              loading="lazy"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-[var(--shadow-card)]"
              animate={{ y: [0, i === 0 ? -10 : 10, 0], rotate: [0, i === 0 ? -1.5 : 1.5, 0] }}
              transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut" }}
              style={{ marginLeft: i === 0 ? 0 : 24 }}
            />
          ))}
        </div>

        {/* Center quote card */}
        <div className="relative mx-auto w-full max-w-xl">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2rem] border bg-card/80 p-10 shadow-2xl backdrop-blur"
          >
            <Quote className="absolute -top-2 left-6 size-16 text-primary/15" />
            <blockquote className="relative font-display text-2xl font-medium leading-snug sm:text-3xl">
              {current.q}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px w-10 bg-primary/50" />— {current.a}
            </figcaption>
          </motion.div>

          {/* Dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Quote ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-8 bg-primary" : "w-2 bg-border hover:bg-primary/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right photo column */}
        <div className="hidden flex-col gap-5 md:flex">
          {PHOTOS.slice(2, 4).map((src, i) => (
            <motion.img
              key={i}
              src={src}
              alt=""
              loading="lazy"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-[var(--shadow-card)]"
              animate={{ y: [0, i === 0 ? 10 : -10, 0], rotate: [0, i === 0 ? 1.5 : -1.5, 0] }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut" }}
              style={{ marginRight: i === 0 ? 0 : 24 }}
            />
          ))}
        </div>
      </div>

      {/* Mobile photo strip */}
      <div className="mt-10 flex gap-3 overflow-x-auto px-4 pb-2 md:hidden">
        {PHOTOS.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            className="h-40 w-32 shrink-0 rounded-2xl object-cover shadow-md"
          />
        ))}
      </div>
    </section>
  );
}
