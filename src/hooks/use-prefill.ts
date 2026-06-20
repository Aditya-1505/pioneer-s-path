import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type Prefill = { name: string; email: string; phone: string };

/** Returns name/email/phone for the signed-in user (profile + auth fallback). */
export function usePrefill(): Prefill {
  const { user } = useAuth();
  const [data, setData] = useState<Prefill>({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (!user) {
      setData({ name: "", email: "", phone: "" });
      return;
    }
    const fallback: Prefill = {
      name: (user.user_metadata?.name as string) ?? (user.user_metadata?.full_name as string) ?? "",
      email: user.email ?? "",
      phone: (user.user_metadata?.phone as string) ?? user.phone ?? "",
    };
    setData(fallback);
    supabase
      .from("profiles")
      .select("name,email,phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data: p }) => {
        if (!p) return;
        setData({
          name: p.name || fallback.name,
          email: p.email || fallback.email,
          phone: p.phone || fallback.phone,
        });
      });
  }, [user]);

  return data;
}
