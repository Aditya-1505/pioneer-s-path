import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { pageHead, PageHero } from "@/lib/page-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, waLink } from "@/lib/brand";
import { usePrefill } from "@/hooks/use-prefill";

export const Route = createFileRoute("/contact")({
  head: () => pageHead("Contact", "Get in touch with The Pioneer Tours by phone, WhatsApp or email."),
  component: ContactPage,
});

function ContactPage() {
  const prefill = usePrefill();
  const [form, setForm] = useState({ name: "", email: "", phone: "", destination: "", message: "" });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    setForm((f) => ({
      ...f,
      name: f.name || prefill.name,
      email: f.email || prefill.email,
      phone: f.phone || prefill.phone,
    }));
  }, [prefill.name, prefill.email, prefill.phone]);

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Please enter your name");
    if (!form.phone.trim() && !form.email.trim()) return toast.error("Add a phone or email so we can reach you");
    if (!form.message.trim()) return toast.error("Please add a message");
    setLoading(true);
    const { error } = await supabase.from("inquiries").insert({
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      destination: form.destination || null,
      message: form.message,
    });
    setLoading(false);
    if (error) return toast.error("Something went wrong. Please try again.");
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", phone: "", destination: "", message: "" });
  };

  const contacts = [
    { icon: Phone, label: "Call us", value: BRAND.phoneDisplay, href: `tel:${BRAND.phone}` },
    { icon: MessageCircle, label: "WhatsApp", value: BRAND.phoneDisplay, href: waLink("Hi! I have a question about your tours.") },
    { icon: Mail, label: "Email", value: BRAND.email, href: `mailto:${BRAND.email}` },
    { icon: MapPin, label: "Visit us", value: BRAND.address, href: undefined },
  ];

  return (
    <main>
      <PageHero
        eyebrow="Get in Touch"
        title="We'd Love to Hear From You"
        subtitle="Questions, custom requests or just saying hi — reach out and we'll respond quickly."
      />
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2">
        {/* Contact info */}
        <div className="space-y-4">
          {contacts.map((c, i) => {
            const inner = (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-sky)] text-primary-foreground">
                  <c.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="font-medium">{c.value}</p>
                </div>
              </motion.div>
            );
            return c.href ? (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="block">
                {inner}
              </a>
            ) : (
              <div key={c.label}>{inner}</div>
            );
          })}
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8"
        >
          <h2 className="font-display text-xl font-semibold">Send a message</h2>
          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
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
              <Label htmlFor="dest">Destination of interest</Label>
              <Input id="dest" className="mt-1.5" placeholder="e.g. Kashmir" value={form.destination} onChange={(e) => set("destination", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="msg">Message *</Label>
              <Textarea id="msg" rows={4} className="mt-1.5" value={form.message} onChange={(e) => set("message", e.target.value)} />
            </div>
            <Button variant="hero" className="w-full" size="lg" onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Send Message
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
