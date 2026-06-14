import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { TagBadge } from "@/components/retro/TagBadge";
import { formatDate } from "@/lib/utils";
import { EqualizerBars } from "@/components/retro/EqualizerBars";

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag } = await searchParams;
  const allPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  const filtered = tag
    ? allPosts.filter((p) => p.tags?.includes(tag))
    : allPosts;

  const allTags = [...new Set(allPosts.flatMap((p) => p.tags || []))];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <EqualizerBars />
        <h1 className="font-heading text-3xl text-wood font-bold">Блог</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/blog">
          <TagBadge tag="Все" active={!tag} />
        </Link>
        {allTags.map((t) => (
          <Link key={t} href={`/blog?tag=${t}`}>
            <TagBadge tag={t} active={tag === t} />
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block border-2 border-wood/20 hover:border-copper transition-colors group"
          >
            <div className="flex gap-4 sm:gap-6 p-4 sm:p-6">
              {post.coverUrl && (
                <div className="tape-box w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden">
                  <img
                    src={post.coverUrl}
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-copper">
                    {formatDate(post.createdAt!)}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-wood/30 border border-wood/20 px-2 py-0.5">
                    {post.type === "original" ? "Моя статья" : "Из интернета"}
                  </span>
                </div>
                <h2 className="font-heading text-lg sm:text-xl text-wood group-hover:text-neon transition-colors font-semibold mb-2">
                  {post.title}
                </h2>
                <p className="font-mono text-xs sm:text-sm text-wood/60 line-clamp-2 mb-3">
                  {post.summary || post.content?.slice(0, 200)}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
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
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-heading text-xl text-wood/40">Постов пока нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
