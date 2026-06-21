import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Check, Sparkles, MessageCircle } from "lucide-react";
import { pageHead, PageHero } from "@/lib/page-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, BUDGETS, GROUP_TYPES, TRAVEL_VIBES, waLink } from "@/lib/brand";
import { recommendDestinations } from "@/lib/destinations";
import { usePrefill } from "@/hooks/use-prefill";

export const Route = createFileRoute("/custom-planner")({
  head: () =>
    pageHead("Plan My Trip", "Tell us your dream trip and get a custom itinerary built just for you by The Pioneer Tours."),
  component: CustomPlanner,
});

type Form = {
  name: string;
  email: string;
  phone: string;
  budget: string;
  travelers: string;
  travel_dates: string;
  destination_preference: string;
  vibe: string;
  requirements: string;
};

const empty: Form = {
  name: "",
  email: "",
  phone: "",
  budget: "",
  travelers: "",
  travel_dates: "",
  destination_preference: "",
  vibe: "",
  requirements: "",
};

function CustomPlanner() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(empty);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const prefill = usePrefill();

  useEffect(() => {
    setForm((f) => ({
      ...f,
      name: f.name || prefill.name,
      email: f.email || prefill.email,
      phone: f.phone || prefill.phone,
    }));
  }, [prefill.name, prefill.email, prefill.phone]);

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const recs = recommendDestinations({ budget: form.budget, vibe: form.vibe });

  const next = () => {
    if (step === 0 && !form.vibe) return toast.error("Pick a travel vibe");
    if (step === 1 && !form.budget) return toast.error("Pick a budget");
    setStep((s) => Math.min(s + 1, 3));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Please enter your name");
    if (!form.phone.trim()) return toast.error("Please enter a phone or WhatsApp number");
    setLoading(true);
    const { error } = await supabase.from("custom_trip_requests").insert({
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      budget: form.budget || null,
      travelers: form.travelers || null,
      travel_dates: form.travel_dates || null,
      destination_preference: form.destination_preference || form.vibe || null,
      requirements: form.requirements || null,
    });
    setLoading(false);
    if (error) return toast.error("Something went wrong. Please try again.");
    setDone(true);
    toast.success("Your custom trip request is in! We'll be in touch shortly.");
  };

  const waMessage = `Hi ${BRAND.name}! I'd love a custom trip plan.%0A%0AName: ${form.name}%0AVibe: ${form.vibe}%0ABudget: ${form.budget}%0ATravelers: ${form.travelers}%0ADates: ${form.travel_dates}%0APreference: ${form.destination_preference}`;

  if (done) {
    return (
      <main>
        <PageHero eyebrow="Plan My Trip" title="Request Received" subtitle="Our travel designers are on it." />
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <Check className="size-8" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold">Thank you, {form.name.split(" ")[0]}!</h2>
          <p className="mt-3 text-muted-foreground">
            We've received your preferences and will craft a personalised itinerary within 24 hours.
            Want a faster response? Ping us on WhatsApp.
          </p>
          <Button asChild variant="forest" size="lg" className="mt-6">
            <a href={waLink(decodeURIComponent(waMessage))} target="_blank" rel="noreferrer">
              <MessageCircle className="size-5" /> Chat on WhatsApp
            </a>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        eyebrow="Plan My Trip"
        title="Your Dream Trip, Tailor-Made"
        subtitle="Answer a few quick questions and our experts will design a journey just for you."
      />
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* progress */}
        <div className="mb-8 flex items-center gap-2">
          {["Vibe", "Budget", "Details", "Contact"].map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </div>
              {i < 3 && <div className={`h-1 flex-1 rounded ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold">What's your travel vibe?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Pick the experience that excites you most.</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {TRAVEL_VIBES.map((v) => (
                      <button
                        key={v}
                        onClick={() => set("vibe", v)}
                        className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                          form.vibe === v
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold">What's your budget per person?</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {BUDGETS.map((b) => (
                      <button
                        key={b}
                        onClick={() => set("budget", b)}
                        className={`rounded-2xl border px-4 py-4 text-left font-medium transition-colors ${
                          form.budget === b
                            ? "border-primary bg-primary/10"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-semibold">Trip details</h2>
                  <div>
                    <Label>Who's travelling?</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {GROUP_TYPES.map((g) => (
                        <button
                          key={g}
                          onClick={() => set("travelers", g)}
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                            form.travelers === g
                              ? "border-primary bg-primary text-primary-foreground"
                              : "bg-background hover:bg-accent"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dates">Approx. travel dates</Label>
                    <Input id="dates" className="mt-1.5" placeholder="e.g. Mid-October, 6 days" value={form.travel_dates} onChange={(e) => set("travel_dates", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="dest">Destination preference (optional)</Label>
                    <Input id="dest" className="mt-1.5" placeholder="e.g. Manali, Kashmir..." value={form.destination_preference} onChange={(e) => set("destination_preference", e.target.value)} />
                  </div>
                  {recs.length > 0 && (
                    <div className="rounded-2xl border bg-accent/40 p-4">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <Sparkles className="size-4 text-primary" /> We'd suggest:
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {recs.map((r) => r.name).join(" · ")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-semibold">Where can we reach you?</h2>
                  <div>
                    <Label htmlFor="name">Full name *</Label>
                    <Input id="name" className="mt-1.5" value={form.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="phone">Phone / WhatsApp</Label>
                      <Input id="phone" className="mt-1.5" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" className="mt-1.5" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="req">Anything else? (optional)</Label>
                    <Textarea id="req" className="mt-1.5" rows={3} placeholder="Special requests, occasions, dietary needs..." value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            {step < 3 ? (
              <Button variant="hero" onClick={next}>
                Next <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button variant="hero" onClick={submit} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Get My Plan
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
