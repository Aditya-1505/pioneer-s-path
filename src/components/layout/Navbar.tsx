import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Menu, X, Moon, Sun, Compass, LayoutDashboard, LogIn, LogOut, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, BRAND } from "@/lib/brand";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/", replace: true });
  };

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-soft py-2" : "bg-transparent py-4",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid size-9 place-items-center rounded-full bg-[image:var(--gradient-sky)] text-primary-foreground">
            <Compass className="size-5" />
          </span>
          <span className="text-foreground">{BRAND.name.replace("The ", "")}</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) =>
            l.children ? (
              <NavDropdown key={l.label} label={l.label} items={l.children} />
            ) : (
              <Link
                key={l.to}
                to={l.to!}
                className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "text-primary font-semibold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ),
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid size-9 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          {/* Auth controls (desktop) */}
          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                {isStaff && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin">
                      <LayoutDashboard className="size-4" /> Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="size-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">
                    <LogIn className="size-4" /> Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    <UserPlus className="size-4" /> Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          <Button asChild variant="hero" className="hidden sm:inline-flex">
            <Link to="/custom-planner">Plan My Trip</Link>
          </Button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="grid size-9 place-items-center rounded-full text-foreground lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass mx-4 mt-2 overflow-hidden rounded-2xl lg:hidden"
          >
            <div className="flex flex-col p-3">
              {NAV_LINKS.flatMap((l) =>
                l.children
                  ? [
                      <div key={l.label} className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {l.label}
                      </div>,
                      ...l.children.map((c) => (
                        <Link
                          key={c.to}
                          to={c.to}
                          className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-accent"
                          activeProps={{ className: "text-primary font-semibold" }}
                        >
                          {c.label}
                        </Link>
                      )),
                    ]
                  : [
                      <Link
                        key={l.to}
                        to={l.to!}
                        className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-accent"
                        activeProps={{ className: "text-primary font-semibold" }}
                        activeOptions={{ exact: l.to === "/" }}
                      >
                        {l.label}
                      </Link>,
                    ],
              )}

              <div className="my-2 h-px bg-border" />

              {user ? (
                <>
                  {isStaff && (
                    <Link to="/admin" className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium hover:bg-accent">
                      <LayoutDashboard className="size-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={signOut} className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-accent">
                    <LogOut className="size-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium hover:bg-accent">
                    <LogIn className="size-4" /> Sign In
                  </Link>
                  <Link to="/auth" search={{ mode: "signup" }} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium hover:bg-accent">
                    <UserPlus className="size-4" /> Sign Up
                  </Link>
                </>
              )}

              <Button asChild variant="hero" className="mt-2">
                <Link to="/custom-planner">Plan My Trip</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavDropdown({ label, items }: { label: string; items: { label: string; to: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
      >
        {label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12 }}
            className="glass absolute left-1/2 top-full z-50 mt-2 min-w-[180px] -translate-x-1/2 overflow-hidden rounded-2xl border shadow-lg"
          >
            <div className="p-1">
              {items.map((c) => (
                <Link
                  key={c.to}
                  to={c.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-accent"
                  activeProps={{ className: "text-primary font-semibold" }}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
