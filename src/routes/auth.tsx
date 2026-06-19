import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mountain } from "lucide-react";
import { pageHead } from "@/lib/page-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/auth")({
  head: () => pageHead("Sign In", "Access your Pioneer Tours account or staff dashboard."),
  validateSearch: (search: Record<string, unknown>): { mode?: "login" | "signup" } => ({
    mode: search.mode === "signup" ? "signup" : undefined,
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passSchema = z.string().min(6, "Password must be at least 6 characters").max(72);

function AuthPage() {
  const navigate = useNavigate();
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">(initialMode === "signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async () => {
    const e = emailSchema.safeParse(email);
    const p = passSchema.safeParse(password);
    if (!e.success) return toast.error(e.error.issues[0].message);
    if (!p.success) return toast.error(p.error.issues[0].message);

    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: e.data,
        password: p.data,
        options: { data: { name }, emailRedirectTo: window.location.origin + "/admin" },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Account created! You're signed in.");
      navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: e.data,
        password: p.data,
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome back!");
      navigate({ to: "/admin" });
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/admin",
    });
    if (result.error) return toast.error("Google sign-in failed. Please try again.");
    if (result.redirected) return;
    navigate({ to: "/admin" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-xl">
        <Link to="/" className="flex items-center justify-center gap-2 text-primary">
          <Mountain className="h-6 w-6" />
          <span className="font-display text-xl font-bold">{BRAND.name}</span>
        </Link>
        <h1 className="mt-6 text-center font-display text-2xl font-bold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to continue to your dashboard."
            : "Join us to manage and track your trips."}
        </p>

        <div className="mt-6 space-y-3">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <Button className="w-full" onClick={submit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={google}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35 11.1H12v3.83h5.35c-.23 1.4-1.65 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.96 3.6 14.7 2.6 12 2.6 6.93 2.6 2.85 6.68 2.85 11.75S6.93 20.9 12 20.9c5.27 0 8.76-3.7 8.76-8.92 0-.6-.06-1.06-.16-1.52z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            className="font-medium text-primary hover:underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
}
