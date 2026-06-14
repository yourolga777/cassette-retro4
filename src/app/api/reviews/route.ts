import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, orders } from "@/lib/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { verifyUserSession } from "@/lib/auth-user";

export async function POST(request: NextRequest) {
  const userId = await verifyUserSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, text, rating } = body;

    if (!productId || !text || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const existing = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Вы уже оставили отзыв на этот товар" }, { status: 409 });
    }

    const userOrders = await db
      .select({ id: orders.id, items: orders.items })
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          or(eq(orders.status, "paid"), eq(orders.status, "pending"))
        )
      );

    const purchased = userOrders.some((order) => {
      const items = order.items as Array<{ id?: number }>;
      return items?.some((item) => item.id === productId);
    });

    if (!purchased) {
      return NextResponse.json({ error: "Вы не покупали этот товар" }, { status: 403 });
    }

    const [review] = await db
      .insert(reviews)
      .values({
        text,
        rating,
        productId,
        userId,
        status: "pending",
      })
      .returning();

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
