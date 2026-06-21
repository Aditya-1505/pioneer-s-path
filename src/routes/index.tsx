import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, ShieldCheck, Headphones, Award, Heart, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { PlanWizard } from "@/components/home/PlanWizard";
import { Testimonials } from "@/components/home/Testimonials";
import { IndiaMap } from "@/components/home/IndiaMap";
import { SafetyTrust } from "@/components/home/SafetyTrust";
import { FloatingPhotos } from "@/components/home/FloatingPhotos";
import { ConversionPlanners } from "@/components/home/ConversionPlanners";
import { JourneyExplorer } from "@/components/home/JourneyExplorer";
import { FAQPreview } from "@/components/home/FAQPreview";
import { DESTINATIONS } from "@/lib/destinations";
import { BRAND, waLink } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Pioneer Tours — Curated Journeys. Hassle-Free Memories." },
      { name: "description", content: "Plan your dream trip in 60 seconds. Premium curated group, couple, family & surprise trips across Manali, Spiti, Kerala, Goa, Kashmir & Ladakh." },
      { property: "og:title", content: "The Pioneer Tours" },
      { property: "og:description", content: "Curated Journeys. Hassle-Free Memories." },
    ],
  }),
  component: Home,
});

const HERO_IMG = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80";

const TRUST = [
  { icon: Award, stat: "25+", label: "Successful Expeditions" },
  { icon: Heart, stat: "5,000+", label: "Happy Travellers" },
  { icon: ShieldCheck, stat: "100%", label: "Verified Stays" },
  { icon: Users, stat: "30+", label: "Expert Coordinators" },
  { icon: Headphones, stat: "24/7", label: "Travel Assistance" },
];

const QUOTES = [
  "Not all who wander are lost ✦", "Collect moments, not things",
  "The mountains are calling 🏔️", "Adventure is out there!",
  "Let's get lost together 🌍", "Take only memories, leave only footprints",
  "Travel far enough to meet yourself", "Born to roam ✈️",
  "Sunsets & spreadsheets don't mix 😎", "Pack light, dream big",
];

type Tour = {
  id: string; title: string; slug: string; destination: string | null;
  duration: string | null; price: number | null; hero_image: string | null;
  difficulty: string | null; featured: boolean | null; departure_dates: string[] | null;
};

function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  useEffect(() => {
    supabase
      .from("tours")
      .select("id,title,slug,destination,duration,price,hero_image,difficulty,featured,departure_dates")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .limit(6)
      .then(({ data }) => setTours((data as Tour[]) ?? []));
  }, []);


  return (
    <main>
      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <motion.img
          src={HERO_IMG}
          alt="Misty mountain valley at sunrise"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: "easeOut" }}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl font-bold leading-tight drop-shadow-lg sm:text-6xl md:text-7xl"
          >
            Curated Journeys.<br />Hassle-Free Memories.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-white/90 drop-shadow"
          >
            Premium group, couple, family & surprise trips across India's most stunning destinations — planned end-to-end by experts who've led 25+ expeditions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild variant="hero" size="xl"><Link to="/tours">Explore Trips</Link></Button>
            <Button asChild variant="glass" size="xl"><a href="#plan">Plan My Trip</a></Button>
            <Button asChild variant="forest" size="xl">
              <a href={waLink(`Hi ${BRAND.name}! I'd like to plan a trip.`)} target="_blank" rel="noreferrer"><MessageCircle className="size-5" /> WhatsApp Us</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* TRUST RIBBON */}
      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST.map((t, i) => (
            <Reveal key={t.label} delay={i * 0.05} className="flex flex-col items-center text-center">
              <t.icon className="size-7 text-primary" />
              <div className="mt-2 font-display text-2xl font-bold sm:text-3xl">{t.stat}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">{t.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SIDE-BY-SIDE CONVERSION PLANNERS */}
      <ConversionPlanners />

      {/* FEATURED TOURS */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-secondary">Handpicked</span>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Featured Tour Packages</h2>
            </div>
            <Button asChild variant="outline" className="rounded-full"><Link to="/tours">View all <ArrowRight className="size-4" /></Link></Button>
          </Reveal>
          {tours.length === 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {DESTINATIONS.slice(0, 3).map((d, i) => (
                <Reveal key={d.slug} delay={i * 0.08}>
                  <FallbackCard name={d.name} image={d.image} price={d.priceFrom} highlight={d.highlights[0]} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.08}>
                  <Link to="/tours/$slug" params={{ slug: t.slug }} className="group block overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:shadow-[var(--shadow-card)]">
                    <div className="relative h-52 overflow-hidden">
                      <img src={t.hero_image ?? DESTINATIONS[i % DESTINATIONS.length].image} alt={t.title} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                      {t.featured && <span className="absolute left-3 top-3 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-sand-foreground">Featured</span>}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" /> {t.destination}</div>
                      <h3 className="mt-1 font-display text-xl font-semibold">{t.title}</h3>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="size-4" /> {t.duration}</span>
                        <span className="font-display text-lg font-bold text-primary">₹{(t.price ?? 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WALL OF LOVE — moved up to build trust early */}
      <Testimonials />

      {/* UNIFIED TOUR EXPLORER — Featured / Trending / In Season */}
      <JourneyExplorer />

      {/* INSPIRATION WALL */}
      <section className="overflow-hidden bg-secondary/5 py-16">
        <Reveal className="mb-8 px-4 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Travel Inspiration Wall</h2>
          <p className="mt-2 text-muted-foreground">Hover to pause the wander.</p>
        </Reveal>
        <div className="pause-on-hover relative flex w-full">
          <div className="animate-marquee flex shrink-0 gap-4 pr-4">
            {[...QUOTES, ...QUOTES].map((q, i) => (
              <div key={i} className="grid h-28 w-64 shrink-0 place-items-center rounded-2xl border bg-card p-5 text-center font-display text-lg font-medium shadow-sm">
                {q}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE INDIA MAP */}
      <IndiaMap />

      {/* SAFETY & TRUST */}
      <SafetyTrust />

      {/* FLOATING PHOTOS + QUOTE CAROUSEL */}
      <FloatingPhotos />

      {/* FAQ PREVIEW */}
      <FAQPreview />
    </main>
  );
}

function FallbackCard({ name, image, price, highlight }: { name: string; image: string; price: number; highlight: string }) {
  return (
    <Link to="/tours" className="group block overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:shadow-[var(--shadow-card)]">
      <div className="h-52 overflow-hidden">
        <img src={image} alt={name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-semibold">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{highlight}</p>
        <div className="mt-3 font-display text-lg font-bold text-primary">From ₹{price.toLocaleString("en-IN")}</div>
      </div>
    </Link>
  );
}
