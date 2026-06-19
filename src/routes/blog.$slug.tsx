import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Clock, User, Share2, Facebook, Linkedin, Link2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blogs")
      .select("title,cover_image,content,category,meta_description,meta_title,created_at,slug")
      .eq("slug", params.slug)
      .maybeSingle();
    if (!data) throw notFound();
    return { post: data };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.post;
    const title = p?.meta_title || p?.title || "Article";
    const desc = p?.meta_description || "A travel story from The Pioneer Tours.";
    const url = `/blog/${params.slug}`;
    const img = p?.cover_image ?? undefined;
    return {
      meta: [
        { title: `${title} — The Pioneer Tours` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: desc,
          image: img ? [img] : undefined,
          datePublished: p.created_at,
          author: { "@type": "Organization", name: "The Pioneer Tours" },
          publisher: { "@type": "Organization", name: "The Pioneer Tours" },
        }),
      }] : undefined,
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-4 py-32 text-center">
      <h1 className="font-display text-3xl font-bold">Article not found</h1>
      <p className="mt-3 text-muted-foreground">This story may have moved or been removed.</p>
      <Button asChild variant="hero" className="mt-6">
        <Link to="/blog">Back to Blog</Link>
      </Button>
    </main>
  ),
  errorComponent: () => (
    <main className="mx-auto max-w-2xl px-4 py-32 text-center">
      <h1 className="font-display text-3xl font-bold">Couldn't load article</h1>
      <Button asChild variant="hero" className="mt-6">
        <Link to="/blog">Back to Blog</Link>
      </Button>
    </main>
  ),
  component: BlogPost,
});

type Related = { id: string; title: string; slug: string; cover_image: string | null; category: string | null };

function readingTime(content: string | null) {
  const words = (content ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function BlogPost() {
  const { post } = Route.useLoaderData();
  const [related, setRelated] = useState<Related[]>([]);
  const [recent, setRecent] = useState<Related[]>([]);
  const [loadingRel, setLoadingRel] = useState(true);

  useEffect(() => {
    Promise.all([
      post.category
        ? supabase.from("blogs").select("id,title,slug,cover_image,category")
            .eq("category", post.category).neq("slug", post.slug).limit(3)
        : Promise.resolve({ data: [] }),
      supabase.from("blogs").select("id,title,slug,cover_image,category")
        .neq("slug", post.slug).order("created_at", { ascending: false }).limit(4),
    ]).then(([r1, r2]) => {
      setRelated((r1.data as Related[]) ?? []);
      setRecent((r2.data as Related[]) ?? []);
      setLoadingRel(false);
    });
  }, [post.slug, post.category]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : `/blog/${post.slug}`;
  const shareText = encodeURIComponent(`${post.title} — The Pioneer Tours`);
  const shares = [
    { label: "WhatsApp", icon: Share2, href: `https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}` },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  ];

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); toast.success("Link copied"); }
    catch { toast.error("Copy failed"); }
  };

  const date = new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const mins = readingTime(post.content);

  return (
    <main className="pb-24 pt-24">
      {post.cover_image && (
        <div className="h-[42vh] w-full overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}
      <article className="mx-auto max-w-3xl px-4">
        <div className="-mt-16 rounded-3xl border bg-card p-6 shadow-lg sm:p-10">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="size-4" /> All articles
          </Link>
          {post.category && (
            <span className="ml-3 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              {post.category}
            </span>
          )}
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><User className="size-4" /> Pioneer Editorial</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="size-4" /> {date}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> {mins} min read</span>
          </div>

          <div className="prose prose-neutral mt-6 max-w-none whitespace-pre-wrap text-foreground/90 dark:prose-invert">
            {post.content || post.meta_description}
          </div>

          {/* Share */}
          <div className="mt-10 border-t pt-6">
            <p className="mb-3 text-sm font-semibold">Share this story</p>
            <div className="flex flex-wrap gap-2">
              {shares.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm hover:bg-accent">
                  <s.icon className="size-4" /> {s.label}
                </a>
              ))}
              <button onClick={copyLink}
                className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm hover:bg-accent">
                <Link2 className="size-4" /> Copy link
              </button>
            </div>
          </div>
        </div>

        {/* Related */}
        {!loadingRel && related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold">Related articles</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <PostCard key={r.id} p={r} />)}
            </div>
          </section>
        )}

        {/* Recent */}
        {!loadingRel && recent.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold">Recent articles</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((r) => <PostCard key={r.id} p={r} />)}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}

function PostCard({ p }: { p: Related }) {
  return (
    <Link to="/blog/$slug" params={{ slug: p.slug }}
      className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {p.cover_image && (
        <div className="h-32 overflow-hidden">
          <img src={p.cover_image} alt={p.title} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="p-4">
        {p.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{p.category}</span>
        )}
        <p className="mt-1 line-clamp-2 font-display text-sm font-semibold">{p.title}</p>
      </div>
    </Link>
  );
}
