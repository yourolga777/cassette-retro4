import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { MDXRemote } from "@/components/MDXRemote";
import { formatDate } from "@/lib/utils";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/blog"
        className="font-mono text-xs uppercase tracking-wider text-copper hover:text-neon transition-colors mb-6 inline-block"
      >
        ← Назад в блог
      </Link>

      <article>
        {post.coverUrl && (
          <div className="relative w-full h-48 sm:h-64 lg:h-80 mb-8 tape-box overflow-hidden">
            <img
              src={post.coverUrl}
              alt={post.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/30 to-transparent pointer-events-none" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-copper">
            {formatDate(post.createdAt!)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-wood/30 border border-wood/20 px-2 py-0.5">
            {post.type === "original" ? "Моя статья" : "Из интернета"}
          </span>
        </div>

        <h1 className="font-heading text-3xl text-wood font-bold mb-6">
          {post.title}
        </h1>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] text-wood/40 border border-wood/10 px-2 py-0.5"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {post.type === "saved" && post.sourceUrl && (
          <div className="border-2 border-wood/20 p-4 mb-8 text-sm font-mono text-wood/60">
            Источник:{" "}
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-copper hover:text-neon underline"
            >
              {post.sourceUrl}
            </a>
          </div>
        )}

        <div className="font-mono text-sm text-wood/80 leading-relaxed">
          {post.type === "original" && post.content ? (
            <MDXRemote content={post.content} />
          ) : post.summary ? (
            <p>{post.summary}</p>
          ) : null}
        </div>
      </article>
    </div>
  );
}
