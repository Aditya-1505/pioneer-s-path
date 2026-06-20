import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

type Q = { id: string; question: string; answer: string | null };

export function FAQPreview() {
  const [rows, setRows] = useState<Q[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("faq")
      .select("id,question,answer")
      .is("tour_id", null)
      .order("display_order", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        const r = (data as Q[]) ?? [];
        setRows(r);
        if (r[0]) setOpen(r[0].id);
      });
  }, []);

  if (rows.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-wider text-secondary">Help Center</span>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Questions, answered.</h2>
          <p className="mt-3 text-muted-foreground">
            Quick answers to the things travellers ask us most often — bookings, safety, payments and more.
          </p>
          <Link
            to="/faq"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
          >
            <HelpCircle className="size-4" /> Browse all FAQs <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="space-y-3">
          {rows.map((r) => {
            const isOpen = open === r.id;
            return (
              <div key={r.id} className="overflow-hidden rounded-2xl border bg-card">
                <button
                  onClick={() => setOpen(isOpen ? null : r.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium">{r.question}</span>
                  <ChevronDown
                    className={`size-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
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
          })}
        </Reveal>
      </div>
    </section>
  );
}
