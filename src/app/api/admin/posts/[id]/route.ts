import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, type, content, sourceUrl, summary, coverUrl, tags, published } = body;

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (type) updateData.type = type;
    if (content !== undefined) updateData.content = content;
    if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl;
    if (summary !== undefined) updateData.summary = summary;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
    if (tags !== undefined) updateData.tags = tags;
    if (published !== undefined) updateData.published = published;
    updateData.updatedAt = new Date();

    const [post] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, Number(id)))
      .returning();

    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await db.delete(posts).where(eq(posts.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
