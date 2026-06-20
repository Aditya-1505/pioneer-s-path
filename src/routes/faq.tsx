import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pageHead, PageHero } from "@/lib/page-helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, waLink } from "@/lib/brand";

export const Route = createFileRoute("/faq")({
  head: () => ({
    ...pageHead("FAQs", "Answers to common questions about bookings, payments, safety and trip planning with The Pioneer Tours."),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [],
        }),
      },
    ],
  }),
  component: FAQPage,
});

type Q = { id: string; question: string; answer: string | null; category: string | null; display_order: number };

function FAQPage() {
  const [rows, setRows] = useState<Q[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("faq")
      .select("id,question,answer,category,display_order")
      .is("tour_id", null)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setRows((data as Q[]) ?? []);
        setLoading(false);
      });
  }, []);

  const cats = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.category).filter(Boolean) as string[]))],
    [rows],
  );

  const filtered = rows.filter((r) => {
    if (activeCat !== "All" && r.category !== activeCat) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return r.question.toLowerCase().includes(q) || (r.answer ?? "").toLowerCase().includes(q);
  });

  return (
    <main>
      <PageHero
        eyebrow="Help Center"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about booking, payments, safety and planning your perfect trip."
      />

      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="h-12 rounded-full pl-11 text-base"
          />
        </div>

        {cats.length > 1 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  activeCat === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
              <HelpCircle className="size-10" />
              <p>No matching questions. Try a different search or ask us directly.</p>
            </div>
          ) : (
            filtered.map((r) => {
              const isOpen = open === r.id;
              return (
                <div key={r.id} className="overflow-hidden rounded-2xl border bg-card">
                  <button
                    onClick={() => setOpen(isOpen ? null : r.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-medium">{r.question}</span>
                    <ChevronDown
                      className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="whitespace-pre-wrap px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                          {r.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-12 rounded-3xl border bg-[image:var(--gradient-sky)] p-8 text-center text-primary-foreground">
          <h2 className="font-display text-2xl font-bold">Still have questions?</h2>
          <p className="mt-2 text-sm text-primary-foreground/85">
            Our travel team replies in minutes on WhatsApp.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="sand">
              <a href={waLink(`Hi ${BRAND.name}! I have a question.`)} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" /> Chat on WhatsApp
              </a>
            </Button>
            <Button asChild variant="glass">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
