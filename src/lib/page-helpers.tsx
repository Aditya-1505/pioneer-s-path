export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — The Pioneer Tours` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — The Pioneer Tours` },
      { property: "og:description", content: description },
    ],
  };
}

export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-32 text-center">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">{title}</h1>
      <p className="mt-4 text-muted-foreground">{blurb}</p>
      <p className="mt-8 rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        This section is being crafted with care. Full experience landing shortly. ✨
      </p>
    </main>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="relative overflow-hidden bg-[image:var(--gradient-sky)] pb-16 pt-32 text-primary-foreground sm:pb-20 sm:pt-36">
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_0%,white,transparent_40%)]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <p className="font-medium uppercase tracking-[0.2em] text-primary-foreground/80">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl md:text-6xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/90 sm:text-lg">
          {subtitle}
        </p>
      </div>
    </header>
  );
}
