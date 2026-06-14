import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.select().from(posts).orderBy(desc(posts.createdAt));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, type, content, sourceUrl, summary, coverUrl, tags, published } = body;

    if (!title || !type) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }

    const slug = slugify(title);

    const [post] = await db
      .insert(posts)
      .values({
        title,
        slug,
        type,
        content: content || null,
        sourceUrl: sourceUrl || null,
        summary: summary || null,
        coverUrl: coverUrl || null,
        tags: tags || [],
        published: published || false,
      })
      .returning();

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
