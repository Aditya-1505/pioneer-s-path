import { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, notificationSection, type Notification } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationBell({ onOpenSection }: { onOpenSection: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, markRead, markAllRead } = useNotifications();

  const handleOpen = (n: Notification) => {
    if (!n.is_read) markRead(n.id);
    onOpenSection(notificationSection(n.type));
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid size-9 place-items-center rounded-full text-foreground/80 transition hover:bg-accent"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-50 w-[360px] max-w-[92vw] overflow-hidden rounded-2xl border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Notifications</p>
                  <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllRead}>
                    <CheckCheck className="size-4" /> Mark all read
                  </Button>
                )}
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {items.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </p>
                ) : (
                  items.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleOpen(n)}
                      className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition hover:bg-accent ${
                        !n.is_read ? "bg-primary/5" : ""
                      }`}
                    >
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${
                          n.is_read ? "bg-muted-foreground/30" : "bg-primary"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        {n.message && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {n.message}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                      {!n.is_read && (
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead(n.id);
                          }}
                          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-background"
                          title="Mark as read"
                        >
                          <Check className="size-3.5" />
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
