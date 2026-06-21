import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND, waLink } from "@/lib/brand";

export function ConnectCTA({
  message,
  title = "Have questions? Talk to a real person.",
  subtitle = "Our trip coordinators reply within minutes — no bots, no forms.",
  className = "",
}: {
  message?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  const wa = waLink(message ?? `Hi ${BRAND.name}! I'd like to know more about your trips.`);
  return (
    <div
      className={`my-8 overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-6 sm:p-8 ${className}`}
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-xl font-bold sm:text-2xl">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg" variant="forest">
            <a href={wa} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" /> WhatsApp Us
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={`tel:${BRAND.phone}`}>
              <Phone className="size-4" /> {BRAND.phoneDisplay}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
