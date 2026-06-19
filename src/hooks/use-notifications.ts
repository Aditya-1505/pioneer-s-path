import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Notification = {
  id: string;
  title: string;
  message: string | null;
  type: string;
  related_table: string | null;
  related_record_id: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
};

const TYPE_TO_SECTION: Record<string, string> = {
  new_inquiry: "inquiries",
  new_booking: "bookings",
  new_custom_trip: "custom",
  new_surprise_trip: "surprise",
  new_planner_request: "planner",
  new_newsletter_subscriber: "subscribers",
};

export function notificationSection(type: string) {
  return TYPE_TO_SECTION[type] ?? "dashboard";
}

export function useNotifications(enabled = true) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("notifications" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setItems(((data as any) ?? []) as Notification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    const channel = supabase
      .channel("notifications-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, load]);

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase
      .from("notifications" as any)
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications" as any)
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("is_read", false);
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return { items, loading, unreadCount, markRead, markAllRead, refresh: load };
}

const SECTION_TO_TABLE: Record<string, string> = {
  bookings: "bookings",
  inquiries: "inquiries",
  custom: "custom_trip_requests",
  surprise: "surprise_trip_requests",
  planner: "trip_planner_requests",
  subscribers: "newsletter_subscribers",
};

export function useUnreadCounts(enabled = true) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    const entries = await Promise.all(
      Object.entries(SECTION_TO_TABLE).map(async ([section, table]) => {
        const { count } = await supabase
          .from(table as any)
          .select("*", { count: "exact", head: true })
          .eq("is_read", false);
        return [section, count ?? 0] as const;
      }),
    );
    setCounts(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    const channels = Object.values(SECTION_TO_TABLE).map((table) =>
      supabase
        .channel(`unread-${table}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          () => load(),
        )
        .subscribe(),
    );
    return () => {
      channels.forEach((c) => supabase.removeChannel(c));
    };
  }, [enabled, load]);

  return counts;
}
