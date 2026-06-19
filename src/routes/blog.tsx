import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Newspaper } from "lucide-react";
import { pageHead, PageHero } from "@/lib/page-helpers";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog")({
  head: () => pageHead("Travel Blog", "Travel guides, tips and stories from The Pioneer Tours."),
  component: BlogPage,
});

type Post = {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  cover_image: string | null;
  category: string | null;
  created_at: string;
};

function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    supabase
      .from("blogs")
      .select("id,title,slug,meta_description,cover_image,category,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as Post[]) ?? []);
        setLoading(false);
      });
  }, []);

  const cats = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean) as string[]))],
    [posts],
  );
  const filtered = posts.filter((p) => cat === "All" || p.category === cat);

  return (
    <main>
      <PageHero
        eyebrow="Stories & Guides"
        title="The Pioneer Journal"
        subtitle="Tips, itineraries and travel inspiration from the road."
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <Newspaper className="size-10" />
            <p>No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={p.cover_image ?? ""}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {p.category && (
                      <span className="w-fit rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                        {p.category}
                      </span>
                    )}
                    <h2 className="mt-2 font-display text-xl font-semibold leading-snug">{p.title}</h2>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{p.meta_description}</p>
                    <span className="mt-4 flex items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
                      Read more <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
