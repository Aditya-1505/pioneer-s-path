import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Heart, ShieldCheck, Users, Mountain, Smile } from "lucide-react";
import { pageHead, PageHero } from "@/lib/page-helpers";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/about")({
  head: () => pageHead("About Us", "25+ expeditions and counting — meet the team behind The Pioneer Tours."),
  component: AboutPage,
});

type Member = { id: string; name: string; role: string | null; image_url: string | null; description: string | null };

const PILLARS = [
  { icon: ShieldCheck, title: "Trust & Safety", text: "Vetted partners, transparent pricing, and 24/7 on-trip support." },
  { icon: Heart, title: "Crafted with Care", text: "Every itinerary is personalised — no cookie-cutter packages." },
  { icon: Award, title: "Proven Track Record", text: "25+ successful expeditions across India's finest destinations." },
  { icon: Smile, title: "Hassle-Free", text: "Stays, transfers and experiences handled end-to-end." },
];

const STATS = [
  { icon: Mountain, value: "25+", label: "Expeditions" },
  { icon: Users, value: "2,000+", label: "Happy Travellers" },
  { icon: Award, value: "6", label: "Signature Destinations" },
  { icon: Smile, value: "4.9★", label: "Average Rating" },
];

function AboutPage() {
  const [team, setTeam] = useState<Member[]>([]);

  useEffect(() => {
    supabase
      .from("team_members")
      .select("id,name,role,image_url,description")
      .order("created_at", { ascending: true })
      .then(({ data }) => setTeam((data as Member[]) ?? []));
  }, []);

  return (
    <main>
      <PageHero
        eyebrow="Our Story"
        title="The Pioneer Tours"
        subtitle="Curated journeys, hassle-free memories — built on 25+ expeditions of trust."
      />

      {/* Story */}
      <section className="mx-auto max-w-4xl px-4 py-14">
        <Reveal>
          <div className="space-y-5 text-center">
            <h2 className="font-display text-3xl font-bold">Where it all began</h2>
            <p className="text-muted-foreground">
              The Pioneer Tours started with a simple belief: travel should feel effortless and deeply personal.
              What began as small group trips to Manali has grown into a trusted travel partner for thousands of
              explorers across Spiti, Kerala, Goa, Kashmir and Ladakh. We obsess over the details — the right stay,
              the perfect sunrise point, the local meal you'll never forget — so you can simply soak it all in.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Stats */}
      <section className="bg-accent/40 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border bg-card p-6 text-center shadow-sm"
            >
              <s.icon className="mx-auto size-7 text-primary" />
              <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold">Why travellers choose us</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-[image:var(--gradient-sky)] text-primary-foreground">
                <p.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section className="bg-accent/40 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-center font-display text-3xl font-bold">Meet the team</h2>
              <p className="mt-2 text-center text-muted-foreground">The people who make your journeys seamless.</p>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.08 }}
                  className="overflow-hidden rounded-2xl border bg-card text-center shadow-sm"
                >
                  {m.image_url && (
                    <img src={m.image_url} alt={m.name} loading="lazy" className="h-56 w-full object-cover" />
                  )}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold">{m.name}</h3>
                    {m.role && <p className="text-sm text-primary">{m.role}</p>}
                    {m.description && <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-display text-3xl font-bold">Ready to explore with us?</h2>
        <p className="mt-3 text-muted-foreground">Let's design a journey you'll talk about for years.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="hero" size="lg">
            <Link to="/custom-planner">Plan My Trip</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/tours">Browse Tours</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
