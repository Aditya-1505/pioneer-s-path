import { Link } from "@tanstack/react-router";
import { Heart, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { PlanWizard } from "@/components/home/PlanWizard";
import { BRAND, waLink } from "@/lib/brand";

export function ConversionPlanners() {
  return (
    <section id="plan" className="mx-auto max-w-7xl px-4 py-20">
      <div className="grid items-start gap-8 md:grid-cols-2">
        {/* Plan My Trip in 60 Seconds */}
        <Reveal>
          <div className="mb-5 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-secondary">
              <Sparkles className="size-4" /> Smart Planner
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Plan My Trip in 60 Seconds</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              4 quick questions → instant matches + a personalized itinerary on WhatsApp.
            </p>
          </div>
          <PlanWizard />
        </Reveal>

        {/* Surprise Someone You Love */}
        <Reveal delay={0.12}>
          <div className="mb-5 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-secondary">
              <Heart className="size-4" /> Surprise Trips
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Surprise Someone You Love</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Anniversary, proposal, honeymoon or just because — we plan it all in secret.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-10">
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-secondary/15 blur-2xl" aria-hidden />
            <div className="relative">
              <div className="grid size-12 place-items-center rounded-2xl bg-secondary/15 text-secondary">
                <Heart className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">
                Make it unforgettable. We'll make it secret.
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                <li className="flex gap-2"><span className="text-secondary">✓</span> Personalised romantic getaways</li>
                <li className="flex gap-2"><span className="text-secondary">✓</span> Discreet planning — we coordinate with one of you</li>
                <li className="flex gap-2"><span className="text-secondary">✓</span> Curated stays, dining & surprises along the way</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild size="lg">
                  <Link to="/surprise-planner">
                    Plan a Surprise <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a
                    href={waLink(`Hi ${BRAND.name}! I'd like to plan a secret surprise trip.`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Already trusted with 200+ surprises — birthdays, proposals & anniversaries.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
