import { ShieldCheck, BadgeCheck, Headphones, FileText, Hotel, HeartPulse } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Link } from "@tanstack/react-router";

const PILLARS = [
  {
    icon: Hotel,
    title: "Verified Accommodations",
    desc: "Every stay is personally inspected and rated for safety, hygiene and comfort before we list it.",
  },
  {
    icon: BadgeCheck,
    title: "Experienced Coordinators",
    desc: "Trip leaders with 25+ expeditions guide every journey — locals who know the terrain inside out.",
  },
  {
    icon: HeartPulse,
    title: "24/7 Emergency Support",
    desc: "On-ground assistance, first-aid trained staff and an always-on helpline throughout your trip.",
  },
  {
    icon: FileText,
    title: "Transparent Cancellation",
    desc: "Clear, fair refund timelines with zero hidden charges — read the policy before you pay.",
  },
];

export function SafetyTrust() {
  return (
    <section className="bg-[image:var(--gradient-sky)] py-20 text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal className="mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="size-4" /> Safety & Trust
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Travel With Total Peace of Mind</h2>
          <p className="mx-auto mt-3 max-w-2xl text-primary-foreground/90">
            Your safety is our promise. Here's how we keep every traveller secure, supported and stress-free across India.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.07}>
              <div className="h-full rounded-3xl bg-background/10 p-6 backdrop-blur-sm transition hover:bg-background/20">
                <span className="grid size-12 place-items-center rounded-2xl bg-background/20">
                  <p.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-primary-foreground/85">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-4 py-2">
            <Headphones className="size-4" /> Helpline: always reachable
          </span>
          <Link to="/cancellation" className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-4 py-2 hover:bg-background/25">
            <FileText className="size-4" /> Read cancellation policy
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
