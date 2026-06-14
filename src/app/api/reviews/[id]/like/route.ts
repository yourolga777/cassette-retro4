import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewLikes, reviews } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { verifyUserSession } from "@/lib/auth-user";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyUserSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const reviewId = parseInt(id);
    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(reviewLikes)
      .where(and(eq(reviewLikes.reviewId, reviewId), eq(reviewLikes.userId, userId)))
      .limit(1);

    if (existing) {
      await db
        .delete(reviewLikes)
        .where(and(eq(reviewLikes.reviewId, reviewId), eq(reviewLikes.userId, userId)));

      await db
        .update(reviews)
        .set({ helpfulCount: sql`${reviews.helpfulCount} - 1` })
        .where(eq(reviews.id, reviewId));

      return NextResponse.json({ liked: false });
    }

    await db.insert(reviewLikes).values({ reviewId, userId });

    await db
      .update(reviews)
      .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
      .where(eq(reviews.id, reviewId));

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error("Toggle like error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
