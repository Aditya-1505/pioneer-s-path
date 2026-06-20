import { useEffect, useState } from "react";
import { MessageCircle, Smartphone, Mail, Bell, ShieldCheck, Construction } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Integration = {
  id: string;
  key: string;
  label: string;
  status: string;
  config: Record<string, any>;
};

const DEFAULTS: { key: string; label: string; icon: typeof MessageCircle; blurb: string }[] = [
  { key: "whatsapp", label: "WhatsApp Business API", icon: MessageCircle, blurb: "Send booking confirmations and lead alerts over WhatsApp." },
  { key: "sms", label: "SMS / OTP Gateway", icon: Smartphone, blurb: "Transactional SMS and OTP delivery for phone login." },
  { key: "email", label: "Transactional Email", icon: Mail, blurb: "Automated email receipts and follow-ups for every lead." },
  { key: "push", label: "Push Notifications", icon: Bell, blurb: "Real-time browser/mobile alerts for new submissions." },
];

export function IntegrationsSettings() {
  const [rows, setRows] = useState<Integration[]>([]);

  useEffect(() => {
    supabase
      .from("integration_settings")
      .select("id,key,label,status,config")
      .then(({ data }) => setRows((data as Integration[]) ?? []));
  }, []);

  const statusOf = (key: string) => rows.find((r) => r.key === key)?.status ?? "not_configured";

  return (
    <div>
      <h2 className="font-display text-xl font-bold">Integrations</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Central notification & messaging services. These activate automatically once API credentials are provided.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {DEFAULTS.map((d) => {
          const status = statusOf(d.key);
          const configured = status === "configured";
          return (
            <div key={d.key} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <d.icon className="size-5" />
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    configured
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {configured ? <ShieldCheck className="size-3" /> : <Construction className="size-3" />}
                  {configured ? "Connected" : "Not Configured"}
                </span>
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{d.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d.blurb}</p>
              {!configured && (
                <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Feature under development — add API credentials to enable.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed bg-muted/40 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Centralized notification service</p>
        <p className="mt-1">
          All new leads (Inquiries, Bookings, Planner, Surprise Trips, Newsletters) already trigger in-app
          notifications. When WhatsApp/SMS/Email credentials are connected, the same events will fan out to those channels.
        </p>
      </div>
    </div>
  );
}
