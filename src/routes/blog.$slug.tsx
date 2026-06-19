import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { pageHead } from "@/lib/page-helpers";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) =>
    pageHead("Article", `Read this travel story from The Pioneer Tours — ${params.slug}.`),
  component: BlogPost,
});

type Post = {
  title: string;
  cover_image: string | null;
  content: string | null;
  category: string | null;
  meta_description: string | null;
  created_at: string;
};

function BlogPost() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    supabase
      .from("blogs")
      .select("title,cover_image,content,category,meta_description,created_at")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setMissing(true);
        else setPost(data as Post);
        setLoading(false);
      });
  }, [slug]);

  if (loading)
    return (
      <main className="grid min-h-[60vh] place-items-center pt-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </main>
    );

  if (missing || !post)
    return (
      <main className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Article not found</h1>
        <p className="mt-3 text-muted-foreground">This story may have moved or been removed.</p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </main>
    );

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
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="prose prose-neutral mt-6 max-w-none whitespace-pre-wrap text-foreground/90 dark:prose-invert">
            {post.content || post.meta_description}
          </div>
        </div>
      </article>
    </main>
  );
}
