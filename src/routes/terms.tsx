import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, FileText } from "lucide-react";
import { pageHead, PageHero } from "@/lib/page-helpers";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("Terms & Conditions", "Terms and conditions for booking with The Pioneer Tours."),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main>
      <PageHero eyebrow="Legal" title="Terms & Conditions"
        subtitle="The rules of the road for booking and travelling with us." />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>

        <Section title="1. Bookings & Confirmation">
          <p>All bookings are confirmed only after we receive a minimum advance of 30% of the total trip cost. The balance must be paid no later than 15 days before the trip start date. We reserve the right to cancel any unconfirmed booking without notice.</p>
        </Section>

        <Section title="2. User Responsibilities">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Provide accurate names, ages and ID details — they must match government-issued ID at check-in.</li>
            <li>Carry valid photo ID (Aadhaar, Passport, Driver's Licence) at all times during the trip.</li>
            <li>Disclose any pre-existing medical conditions before booking. We may decline bookings on safety grounds.</li>
            <li>Behave respectfully towards co-travellers, local communities and the environment.</li>
          </ul>
        </Section>

        <Section title="3. Liability & Force Majeure">
          <p>The Pioneer Tours acts as a coordinator between travellers and service providers (hotels, transport, guides). We are not liable for loss, injury, delay or damage arising from events outside our reasonable control, including natural disasters, strikes, road closures, government regulations, or third-party negligence.</p>
          <p className="mt-2">We strongly recommend that every traveller carry valid travel insurance.</p>
        </Section>

        <Section title="4. Payments">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>All quoted prices are in Indian Rupees (₹) and inclusive of applicable GST unless stated otherwise.</li>
            <li>Payments may be made via UPI, bank transfer, debit/credit card or other published methods.</li>
            <li>Bookings made within 7 days of travel must be paid in full at the time of booking.</li>
          </ul>
        </Section>

        <Section title="5. Refunds">
          <p>Refunds, where applicable, are governed by our <Link to="/cancellation" className="text-primary underline">Cancellation Policy</Link>. Refunds are processed to the original payment method within 7–14 working days of approval.</p>
        </Section>

        <Section title="6. Changes to Itinerary">
          <p>We reserve the right to modify the itinerary due to weather, road, or operational constraints. Where possible, we will offer comparable alternatives.</p>
        </Section>

        <Section title="7. Governing Law">
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Manali, Himachal Pradesh.</p>
        </Section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/privacy"><Shield className="size-4" /> Privacy Policy</Link></Button>
          <Button asChild variant="outline"><Link to="/cancellation"><FileText className="size-4" /> Cancellation Policy</Link></Button>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-2 space-y-2 text-sm text-foreground/85 leading-relaxed">{children}</div>
    </section>
  );
}
