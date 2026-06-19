import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AnnouncementBanner() {
  const [text, setText] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("title,description")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const a = data?.[0];
        if (a) setText([a.title, a.description].filter(Boolean).join(" — "));
      });
  }, []);

  if (!text || dismissed) return null;
  return (
    <div className="relative z-[60] bg-[image:var(--gradient-sand)] text-sand-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-10 py-2 text-center text-sm font-medium">
        <Sparkles className="size-4 shrink-0" />
        <span>{text}</span>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="absolute right-3 opacity-70 hover:opacity-100">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
