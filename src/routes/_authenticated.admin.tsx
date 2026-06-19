import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Inbox,
  Sparkles,
  Gift,
  Compass,
  Quote,
  Images,
  FileText,
  HelpCircle,
  UsersRound,
  Megaphone,
  Mail,
  LogOut,
  Mountain,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ToursAdmin } from "@/components/admin/ToursAdmin";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { SimpleCrud } from "@/components/admin/SimpleCrud";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tours", label: "Tours", icon: Map },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "inquiries", label: "Inquiries", icon: Inbox },
  { id: "custom", label: "Custom Trips", icon: Sparkles },
  { id: "surprise", label: "Surprise Trips", icon: Gift },
  { id: "planner", label: "Trip Planner", icon: Compass },
  { id: "testimonials", label: "Testimonials", icon: Quote },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "blogs", label: "Blogs", icon: FileText },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "team", label: "Team", icon: UsersRound },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "subscribers", label: "Subscribers", icon: Mail },
] as const;

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isStaff, loading } = useAuth();
  const [active, setActive] = useState<string>("dashboard");

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">Staff access required</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          You're signed in as <strong>{user?.email}</strong>, but this account doesn't have staff
          permissions. Ask a super admin to grant you a role.
        </p>
        <div className="mt-6 flex gap-2">
          <Button asChild variant="outline">
            <Link to="/">Back to site</Link>
          </Button>
          <Button onClick={signOut}>Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card md:flex">
        <Link to="/" className="flex items-center gap-2 border-b px-5 py-4 text-primary">
          <Mountain className="h-5 w-5" />
          <span className="font-display font-bold">Pioneer CRM</span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active === s.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </nav>
        <div className="border-t p-3">
          <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile section selector */}
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-card/90 px-4 py-3 backdrop-blur md:hidden">
          <select
            value={active}
            onChange={(e) => setActive(e.target.value)}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          >
            {SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          {active === "dashboard" && <Dashboard onJump={setActive} />}
          {active === "tours" && <ToursAdmin />}
          {active === "bookings" && (
            <LeadsTable
              table="bookings"
              title="Bookings"
              columns={[
                { key: "name", label: "Name" },
                { key: "tour_title", label: "Tour" },
                { key: "travelers", label: "Pax" },
                { key: "total_amount", label: "Total" },
                { key: "created_at", label: "Date" },
              ]}
            />
          )}
          {active === "inquiries" && (
            <LeadsTable
              table="inquiries"
              title="Inquiries"
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "destination", label: "Destination" },
                { key: "created_at", label: "Date" },
              ]}
            />
          )}
          {active === "custom" && (
            <LeadsTable
              table="custom_trip_requests"
              title="Custom Trip Requests"
              columns={[
                { key: "name", label: "Name" },
                { key: "destination_preference", label: "Destination" },
                { key: "budget", label: "Budget" },
                { key: "created_at", label: "Date" },
              ]}
            />
          )}
          {active === "surprise" && (
            <LeadsTable
              table="surprise_trip_requests"
              title="Surprise Trip Requests"
              columns={[
                { key: "name", label: "Name" },
                { key: "occasion", label: "Occasion" },
                { key: "budget", label: "Budget" },
                { key: "created_at", label: "Date" },
              ]}
            />
          )}
          {active === "planner" && (
            <LeadsTable
              table="trip_planner_requests"
              title="Trip Planner Leads"
              columns={[
                { key: "name", label: "Name" },
                { key: "recommendation", label: "Recommendation" },
                { key: "budget", label: "Budget" },
                { key: "created_at", label: "Date" },
              ]}
            />
          )}
          {active === "testimonials" && (
            <SimpleCrud
              table="testimonials"
              title="Testimonials"
              columns={[
                { key: "customer_name", label: "Customer" },
                { key: "rating", label: "Rating" },
                { key: "trip_name", label: "Trip" },
                { key: "photo_url", label: "Photo" },
              ]}
              fields={[
                { key: "customer_name", label: "Customer Name", required: true },
                { key: "rating", label: "Rating (1-5)", type: "number" },
                { key: "review", label: "Review", type: "textarea" },
                { key: "trip_name", label: "Trip Name" },
                { key: "photo_url", label: "Photo URL" },
                { key: "video_url", label: "Video URL" },
              ]}
            />
          )}
          {active === "gallery" && (
            <SimpleCrud
              table="gallery"
              title="Gallery"
              columns={[
                { key: "title", label: "Title" },
                { key: "destination", label: "Destination" },
                { key: "category", label: "Category" },
                { key: "image_url", label: "Image" },
              ]}
              fields={[
                { key: "title", label: "Title" },
                { key: "destination", label: "Destination" },
                { key: "category", label: "Category" },
                { key: "image_url", label: "Image URL", required: true },
                { key: "video_url", label: "Video URL" },
              ]}
            />
          )}
          {active === "blogs" && (
            <SimpleCrud
              table="blogs"
              title="Blogs"
              columns={[
                { key: "title", label: "Title" },
                { key: "slug", label: "Slug" },
                { key: "category", label: "Category" },
                { key: "cover_image", label: "Cover" },
              ]}
              fields={[
                { key: "title", label: "Title", required: true },
                { key: "slug", label: "Slug", required: true },
                { key: "category", label: "Category" },
                { key: "cover_image", label: "Cover Image URL" },
                { key: "meta_title", label: "Meta Title" },
                { key: "meta_description", label: "Meta Description" },
                { key: "content", label: "Content", type: "textarea" },
              ]}
            />
          )}
          {active === "faq" && (
            <SimpleCrud
              table="faq"
              title="FAQ"
              columns={[
                { key: "question", label: "Question" },
                { key: "answer", label: "Answer" },
              ]}
              fields={[
                { key: "question", label: "Question", required: true },
                { key: "answer", label: "Answer", type: "textarea" },
              ]}
            />
          )}
          {active === "team" && (
            <SimpleCrud
              table="team_members"
              title="Team Members"
              columns={[
                { key: "name", label: "Name" },
                { key: "role", label: "Role" },
                { key: "image_url", label: "Photo" },
              ]}
              fields={[
                { key: "name", label: "Name", required: true },
                { key: "role", label: "Role" },
                { key: "image_url", label: "Photo URL" },
                { key: "description", label: "Description", type: "textarea" },
              ]}
            />
          )}
          {active === "announcements" && (
            <SimpleCrud
              table="announcements"
              title="Announcements"
              columns={[
                { key: "title", label: "Title" },
                { key: "active", label: "Active" },
              ]}
              fields={[
                { key: "title", label: "Title", required: true },
                { key: "description", label: "Description", type: "textarea" },
                { key: "active", label: "Active", type: "checkbox" },
              ]}
            />
          )}
          {active === "subscribers" && (
            <LeadsTable
              table="newsletter_subscribers"
              title="Newsletter Subscribers"
              columns={[
                { key: "email", label: "Email" },
                { key: "name", label: "Name" },
                { key: "source", label: "Source" },
                { key: "created_at", label: "Subscribed" },
              ]}
              statuses={["new", "active", "unsubscribed"]}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ onJump }: { onJump: (s: string) => void }) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const tables = [
      "tours",
      "bookings",
      "inquiries",
      "custom_trip_requests",
      "surprise_trip_requests",
      "trip_planner_requests",
      "newsletter_subscribers",
    ];
    Promise.all(
      tables.map((t) =>
        supabase
          .from(t as any)
          .select("*", { count: "exact", head: true })
          .then(({ count }) => [t, count ?? 0] as const),
      ),
    ).then((res) => setCounts(Object.fromEntries(res)));
  }, []);

  const cards = [
    { label: "Tours", key: "tours", section: "tours", icon: Map },
    { label: "Bookings", key: "bookings", section: "bookings", icon: CalendarCheck },
    { label: "Inquiries", key: "inquiries", section: "inquiries", icon: Inbox },
    { label: "Custom Trips", key: "custom_trip_requests", section: "custom", icon: Sparkles },
    { label: "Surprise Trips", key: "surprise_trip_requests", section: "surprise", icon: Gift },
    { label: "Planner Leads", key: "trip_planner_requests", section: "planner", icon: Compass },
    { label: "Subscribers", key: "newsletter_subscribers", section: "subscribers", icon: Mail },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your travel business.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.key}
            onClick={() => onJump(c.section)}
            className="rounded-2xl border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <c.icon className="h-6 w-6 text-primary" />
            <p className="mt-3 font-display text-3xl font-bold">{counts[c.key] ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
