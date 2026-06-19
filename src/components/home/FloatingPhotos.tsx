import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";

const PHOTOS = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=70",
];

const QUOTES = [
  { q: "The journey of a thousand miles begins with one step.", a: "Lao Tzu" },
  { q: "Travel makes one modest. You see what a tiny place you occupy in the world.", a: "Gustave Flaubert" },
  { q: "We travel not to escape life, but for life not to escape us.", a: "Anonymous" },
  { q: "Adventure may hurt you, but monotony will kill you.", a: "Marcus Purvis" },
];

export function FloatingPhotos() {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Floating traveler photos */}
      <div className="pointer-events-none absolute inset-0">
        {PHOTOS.map((src, i) => (
          <motion.img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            className="absolute hidden rounded-2xl object-cover shadow-[var(--shadow-card)] md:block"
            style={{
              width: 90 + (i % 3) * 30,
              height: 90 + (i % 3) * 30,
              left: `${[6, 20, 78, 88, 12, 70][i]}%`,
              top: `${[12, 62, 14, 60, 80, 82][i]}%`,
            }}
            animate={{ y: [0, i % 2 ? 14 : -14, 0], rotate: [0, i % 2 ? 3 : -3, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Travel quote carousel */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-wider text-secondary">Wanderlust</span>
        </Reveal>
        <div className="relative mt-4 h-40 sm:h-32">
          {QUOTES.map((item, i) => (
            <motion.figure
              key={i}
              className="absolute inset-0 flex flex-col items-center justify-center"
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                duration: QUOTES.length * 4,
                times: [
                  (i / QUOTES.length),
                  (i / QUOTES.length) + 0.04,
                  ((i + 1) / QUOTES.length) - 0.04,
                  ((i + 1) / QUOTES.length),
                ],
                repeat: Infinity,
              }}
            >
              <blockquote className="font-display text-2xl font-semibold leading-snug sm:text-3xl">
                “{item.q}”
              </blockquote>
              <figcaption className="mt-3 text-sm text-muted-foreground">— {item.a}</figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
