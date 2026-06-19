import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Shield, CalendarX, AlertTriangle } from "lucide-react";
import { pageHead, PageHero } from "@/lib/page-helpers";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cancellation")({
  head: () => pageHead("Cancellation Policy", "Cancellation and refund policy for The Pioneer Tours."),
  component: CancellationPage,
});

const WINDOWS = [
  { range: "30+ days before departure", refund: "90% refund", color: "text-emerald-600" },
  { range: "15–29 days before departure", refund: "50% refund", color: "text-amber-600" },
  { range: "7–14 days before departure", refund: "25% refund", color: "text-orange-600" },
  { range: "Less than 7 days / no-show", refund: "No refund", color: "text-red-600" },
];

function CancellationPage() {
  return (
    <main>
      <PageHero eyebrow="Legal" title="Cancellation Policy"
        subtitle="Clear, fair refund timelines — no surprises, no fine-print traps." />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>

        <Section title="1. Cancellation Windows & Refund Percentages" icon={CalendarX}>
          <div className="mt-3 overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase">
                <tr><th className="px-4 py-2 text-left">Cancellation window</th><th className="px-4 py-2 text-left">Refund</th></tr>
              </thead>
              <tbody>
                {WINDOWS.map((w) => (
                  <tr key={w.range} className="border-t">
                    <td className="px-4 py-2.5">{w.range}</td>
                    <td className={`px-4 py-2.5 font-semibold ${w.color}`}>{w.refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Refund percentages apply to the total trip cost minus non-refundable third-party charges (such as flight tickets, permit fees, or special-event passes).</p>
        </Section>

        <Section title="2. How to Cancel">
          <p>Send a written cancellation request from the email address used at the time of booking to our team. Cancellations are time-stamped from the moment we receive the email.</p>
          <p className="mt-2">Approved refunds are processed to the original payment method within 7–14 working days.</p>
        </Section>

        <Section title="3. Rescheduling">
          <p>You may reschedule your trip once at no charge, provided the request is received at least 15 days before departure and the new date falls within the next 6 months. Rate differences (if any) apply.</p>
        </Section>

        <Section title="4. Force Majeure" icon={AlertTriangle}>
          <p>For cancellations caused by force majeure events — natural disasters, government-imposed lockdowns, road or border closures, civil disturbances — we will:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Offer a full credit note valid for 12 months, OR</li>
            <li>Reschedule to a comparable trip on a future date, OR</li>
            <li>Refund the trip cost minus actual non-recoverable third-party expenses already paid on your behalf.</li>
          </ul>
        </Section>

        <Section title="5. Trips Cancelled by Us">
          <p>If we cancel a trip due to insufficient bookings or operational reasons, you receive a 100% refund or a free reschedule — your choice.</p>
        </Section>

        <Section title="6. Non-Refundable Components">
          <p>Some items are non-refundable regardless of cancellation timing: confirmed flight tickets, special permits (Ladakh, Spiti, etc.), pre-purchased event tickets, and personalised arrangements (private guides, custom transport).</p>
        </Section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/terms"><FileText className="size-4" /> Terms & Conditions</Link></Button>
          <Button asChild variant="outline"><Link to="/privacy"><Shield className="size-4" /> Privacy Policy</Link></Button>
        </div>
      </article>
    </main>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: typeof CalendarX; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        {Icon && <Icon className="size-5 text-primary" />} {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm text-foreground/85 leading-relaxed">{children}</div>
    </section>
  );
}
