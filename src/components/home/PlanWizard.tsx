import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MessageCircle, Sparkles, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, BUDGETS, GROUP_TYPES, MONTHS, TRAVEL_VIBES, waLink } from "@/lib/brand";
import { recommendDestinations, type Destination } from "@/lib/destinations";
import { cn } from "@/lib/utils";

const STEPS = ["Budget", "Travelers", "Month", "Vibe"] as const;

export function PlanWizard() {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState<string>();
  const [groupType, setGroupType] = useState<string>();
  const [pax, setPax] = useState(2);
  const [month, setMonth] = useState<string>();
  const [vibe, setVibe] = useState<string>();
  const [results, setResults] = useState<Destination[] | null>(null);

  const canNext =
    (step === 0 && budget) ||
    (step === 1 && groupType) ||
    (step === 2 && month) ||
    (step === 3 && vibe);

  async function finish() {
    const recs = recommendDestinations({ budget, month, vibe });
    setResults(recs);
    await supabase.from("trip_planner_requests").insert({
      budget,
      travelers: `${groupType} · ${pax} pax`,
      month,
      trip_type: vibe,
      group_type: groupType,
      recommendation: recs.map((r) => r.name).join(", "),
    });
  }

  const waMessage = `Hi ${BRAND.name}! 👋 Here's my trip plan:
• Budget: ${budget}
• Travelers: ${groupType} (${pax} pax)
• Month: ${month}
• Vibe: ${vibe}
${results ? `• Interested in: ${results.map((r) => r.name).join(", ")}` : ""}
Please share a personalized itinerary!`;

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-10">
      {!results ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="size-4 text-sand" /> Step {step + 1} of {STEPS.length}
            </div>
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span key={i} className={cn("h-1.5 w-8 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-muted")} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <Choices title="What's your budget per person?" options={BUDGETS as readonly string[]} value={budget} onChange={setBudget} />
              )}
              {step === 1 && (
                <div>
                  <Choices title="Who's travelling?" options={GROUP_TYPES as readonly string[]} value={groupType} onChange={setGroupType} />
                  <div className="mt-6 flex items-center justify-between rounded-2xl bg-muted/60 px-5 py-4">
                    <span className="font-medium">Number of travellers</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setPax((p) => Math.max(1, p - 1))} className="grid size-9 place-items-center rounded-full border hover:bg-accent"><Minus className="size-4" /></button>
                      <span className="w-6 text-center text-lg font-semibold">{pax}</span>
                      <button onClick={() => setPax((p) => Math.min(30, p + 1))} className="grid size-9 place-items-center rounded-full border hover:bg-accent"><Plus className="size-4" /></button>
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <Choices title="Preferred travel month?" options={MONTHS as readonly string[]} value={month} onChange={setMonth} grid />
              )}
              {step === 3 && (
                <Choices title="Pick your travel vibe" options={TRAVEL_VIBES as readonly string[]} value={vibe} onChange={setVibe} grid />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="hero" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button variant="hero" disabled={!canNext} onClick={finish}>
                See my matches <Sparkles className="size-4" />
              </Button>
            )}
          </div>
        </>
      ) : (
        <div>
          <h3 className="text-center font-display text-2xl font-bold sm:text-3xl">Your perfect escapes ✨</h3>
          <p className="mt-2 text-center text-muted-foreground">Hand-picked for a {vibe?.toLowerCase()} {groupType?.toLowerCase()} trip in {month}.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {results.map((d) => (
              <div key={d.slug} className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                <img src={d.image} alt={d.name} loading="lazy" className="h-32 w-full object-cover" />
                <div className="p-4">
                  <h4 className="font-display text-lg font-semibold">{d.name}</h4>
                  <p className="text-sm text-muted-foreground">From ₹{d.priceFrom.toLocaleString("en-IN")}</p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {d.highlights.slice(0, 3).map((h) => <li key={h}>• {h}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button asChild variant="forest" size="xl" className="w-full sm:w-auto">
              <a href={waLink(waMessage)} target="_blank" rel="noreferrer">
                <MessageCircle className="size-5" /> Get Personalized Itinerary on WhatsApp
              </a>
            </Button>
            <button onClick={() => { setResults(null); setStep(0); }} className="text-sm text-muted-foreground hover:text-foreground">Start over</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Choices({ title, options, value, onChange, grid }: {
  title: string; options: readonly string[]; value?: string; onChange: (v: string) => void; grid?: boolean;
}) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold sm:text-2xl">{title}</h3>
      <div className={cn("mt-5 gap-3", grid ? "grid grid-cols-2 sm:grid-cols-3" : "flex flex-col sm:flex-row sm:flex-wrap")}>
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all hover:border-primary",
              value === o ? "border-primary bg-primary/10 text-primary shadow-sm" : "bg-background",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
