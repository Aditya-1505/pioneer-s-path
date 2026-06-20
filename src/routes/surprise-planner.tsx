import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Heart, Gift, Check, MessageCircle, Sparkles } from "lucide-react";
import { pageHead, PageHero } from "@/lib/page-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, BUDGETS, waLink } from "@/lib/brand";
import { Reveal } from "@/components/Reveal";
import { usePrefill } from "@/hooks/use-prefill";

export const Route = createFileRoute("/surprise-planner")({
  head: () =>
    pageHead("Surprise Trips", "Plan a secret romantic, anniversary, proposal or honeymoon getaway with The Pioneer Tours."),
  component: SurprisePlanner,
});

const OCCASIONS = ["Anniversary", "Proposal", "Honeymoon", "Birthday", "Romantic Getaway", "Just Because"];

function SurprisePlanner() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    occasion: "",
    budget: "",
    destination: "",
    requirements: "",
  });
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
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Please enter your name");
    if (!form.occasion) return toast.error("Pick the occasion");
    if (!form.phone.trim() && !form.email.trim()) return toast.error("Add a phone or email so we can reach you");
    setLoading(true);
    const { error } = await supabase.from("surprise_trip_requests").insert({
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      occasion: form.occasion || null,
      budget: form.budget || null,
      destination: form.destination || null,
      requirements: form.requirements || null,
    });
    setLoading(false);
    if (error) return toast.error("Something went wrong. Please try again.");
    setDone(true);
    toast.success("Your surprise is safe with us! 🤫");
  };

  const waMessage = `Hi ${BRAND.name}! I'd like to plan a surprise trip.\n\nName: ${form.name}\nOccasion: ${form.occasion}\nBudget: ${form.budget}\nDestination idea: ${form.destination}`;

  if (done) {
    return (
      <main>
        <PageHero eyebrow="Surprise Trips" title="Shhh… It's Our Secret" subtitle="Your surprise request has landed safely." />
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <Heart className="size-8" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold">We'll make it magical, {form.name.split(" ")[0]}!</h2>
          <p className="mt-3 text-muted-foreground">
            Our team will quietly design a memorable surprise and reach out discreetly within 24 hours.
          </p>
          <Button asChild variant="forest" size="lg" className="mt-6">
            <a href={waLink(waMessage)} target="_blank" rel="noreferrer">
              <MessageCircle className="size-5" /> Continue on WhatsApp
            </a>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        eyebrow="Surprise Trips"
        title="Plan an Unforgettable Surprise"
        subtitle="From proposals to anniversaries, let us orchestrate a getaway they'll never forget."
      />
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-5">
            <h2 className="font-display text-2xl font-bold">Crafted with love & secrecy</h2>
            <p className="text-muted-foreground">
              Tell us the occasion and a few hints. We handle the rest — surprise reveals, candle-lit dinners,
              hidden bookings, and that perfect moment.
            </p>
            <ul className="space-y-3">
              {[
                "100% discreet planning & communication",
                "Personalised romantic touches & reveals",
                "Handpicked stays with a view",
                "End-to-end coordination on the day",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-5 shrink-0 text-secondary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 rounded-2xl border bg-accent/40 p-4">
              <Gift className="size-6 text-primary" />
              <p className="text-sm text-muted-foreground">Over 25 surprise getaways delivered flawlessly.</p>
            </div>
          </div>
        </Reveal>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8"
        >
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Sparkles className="size-5 text-primary" /> Tell us the secret
          </h2>
          <div className="mt-5 space-y-4">
            <div>
              <Label>Occasion *</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => set("occasion", o)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      form.occasion === o
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Budget</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    onClick={() => set("budget", b)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      form.budget === b
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="dest">Destination idea (optional)</Label>
              <Input id="dest" className="mt-1.5" placeholder="Surprise me, or e.g. Goa" value={form.destination} onChange={(e) => set("destination", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Your name *</Label>
                <Input id="name" className="mt-1.5" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Phone / WhatsApp</Label>
                <Input id="phone" className="mt-1.5" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="mt-1.5" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="req">Hints & special requests</Label>
              <Textarea id="req" className="mt-1.5" rows={3} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
            </div>
            <Button variant="hero" className="w-full" size="lg" onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />}
              Plan My Surprise
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
