import { Link } from "@tanstack/react-router";
import { Compass, Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import { useState } from "react";
import { BRAND, NAV_LINKS } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source: "footer", status: "new" });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("Something went wrong. Try again.");
      return;
    }
    toast.success("You're subscribed! Welcome aboard. ✈️");
    setEmail("");
  }

  return (
    <footer className="mt-24 border-t bg-[image:var(--gradient-sky)] text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-2xl font-bold">
            <span className="grid size-9 place-items-center rounded-full bg-background/20">
              <Compass className="size-5" />
            </span>
            Pioneer Tours
          </div>
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/85">{BRAND.tagline}</p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" aria-label="social" className="grid size-9 place-items-center rounded-full bg-background/15 transition hover:bg-background/30">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/85">
            {NAV_LINKS.map((l) => (
              <li key={l.to}><Link to={l.to} className="hover:underline">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold">Reach Us</h4>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/85">
            <li className="flex gap-2"><Phone className="size-4 shrink-0" /><a href={`tel:${BRAND.phone}`}>{BRAND.phoneDisplay}</a></li>
            <li className="flex gap-2"><Mail className="size-4 shrink-0" /><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></li>
            <li className="flex gap-2"><MapPin className="size-4 shrink-0" /><span>{BRAND.address}</span></li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-primary-foreground/70">
            <Link to="/faq" className="hover:underline">FAQs</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/cancellation" className="hover:underline">Cancellation</Link>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold">Travel Inspiration</h4>
          <p className="mt-4 text-sm text-primary-foreground/85">Get curated trips & secret deals in your inbox.</p>
          <form onSubmit={subscribe} className="mt-4 flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="border-background/30 bg-background/15 text-primary-foreground placeholder:text-primary-foreground/60"
            />
            <Button type="submit" variant="sand" disabled={loading}>Join</Button>
          </form>
        </div>
      </div>
      <div className="border-t border-background/20 py-5 text-center text-xs text-primary-foreground/70">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
