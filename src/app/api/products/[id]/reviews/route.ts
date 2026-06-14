import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, users } from "@/lib/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const [avgResult] = await db
      .select({
        average: sql<number>`COALESCE(AVG(${reviews.rating}), 0)::int`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")));

    const approvedReviews = await db
      .select({
        id: reviews.id,
        text: reviews.text,
        rating: reviews.rating,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
        user: {
          name: users.name,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
      .orderBy(desc(reviews.helpfulCount), desc(reviews.createdAt));

    return NextResponse.json({
      reviews: approvedReviews,
      averageRating: avgResult?.average ?? 0,
      totalCount: avgResult?.count ?? 0,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
