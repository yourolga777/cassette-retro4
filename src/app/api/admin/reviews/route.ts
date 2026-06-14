import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, users, products } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const admin = await verifySession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allReviews = await db
      .select({
        id: reviews.id,
        text: reviews.text,
        rating: reviews.rating,
        status: reviews.status,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
        user: { name: users.name, email: users.email },
        product: { id: products.id, name: products.name },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(products, eq(reviews.productId, products.id))
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json(allReviews);
  } catch (error) {
    console.error("Admin get reviews error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
