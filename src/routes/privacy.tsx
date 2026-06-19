import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { pageHead, PageHero } from "@/lib/page-helpers";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("Privacy Policy", "How The Pioneer Tours collects, uses and protects your data."),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main>
      <PageHero eyebrow="Legal" title="Privacy Policy"
        subtitle="Your data, handled responsibly. Here's exactly what we collect and why." />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>

        <Section title="1. Data We Collect">
          <p>When you interact with our site, we may collect:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li><strong>Contact details</strong> — name, email, phone, location, submitted via inquiry, booking, planner or newsletter forms.</li>
            <li><strong>Trip details</strong> — destinations, dates, group size, preferences and budget.</li>
            <li><strong>Payment metadata</strong> — transaction ID and method. We do <em>not</em> store full card numbers; payments are processed by PCI-compliant gateways.</li>
            <li><strong>Technical data</strong> — IP address, browser, device, referrer and anonymised analytics events.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Data">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To respond to inquiries, plan trips and confirm bookings.</li>
            <li>To process payments and issue invoices.</li>
            <li>To send service messages (itinerary updates, booking confirmations) via WhatsApp, email or SMS.</li>
            <li>To send marketing emails — only if you opted in. You can unsubscribe at any time.</li>
            <li>To improve our website, services and customer experience.</li>
          </ul>
        </Section>

        <Section title="3. Cookies & Analytics">
          <p>We use minimal, privacy-friendly cookies to remember preferences (such as theme) and measure anonymous traffic. You can clear or block cookies via your browser settings without losing access to most features.</p>
        </Section>

        <Section title="4. Newsletter Data">
          <p>Newsletter sign-ups capture your email address and (optionally) name. We use this only to send periodic travel guides and offers. Every email includes a one-click unsubscribe link.</p>
        </Section>

        <Section title="5. Sharing With Third Parties">
          <p>We share the minimum necessary information with:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Hotels, transport operators and local guides to deliver your trip.</li>
            <li>Payment gateways to process transactions.</li>
            <li>Government authorities where required by law.</li>
          </ul>
          <p className="mt-2">We never sell your data.</p>
        </Section>

        <Section title="6. Your Rights">
          <p>You have the right to:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction or deletion of your data.</li>
            <li>Withdraw marketing consent at any time.</li>
          </ul>
          <p className="mt-2">To exercise these rights, write to <a href={`mailto:${BRAND.email}`} className="text-primary underline">{BRAND.email}</a>.</p>
        </Section>

        <Section title="7. Data Retention & Security">
          <p>We retain inquiry and booking data for up to 5 years for legal, tax and support purposes, then securely delete it. Data is stored on encrypted, access-controlled cloud infrastructure.</p>
        </Section>

        <Section title="8. Contact">
          <p>Questions? Reach us at <a href={`mailto:${BRAND.email}`} className="text-primary underline">{BRAND.email}</a> or call <a href={`tel:${BRAND.phone}`} className="text-primary underline">{BRAND.phoneDisplay}</a>.</p>
        </Section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/terms"><FileText className="size-4" /> Terms & Conditions</Link></Button>
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
