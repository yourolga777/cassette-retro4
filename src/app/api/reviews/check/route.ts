import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, orders } from "@/lib/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { verifyUserSession } from "@/lib/auth-user";

export async function GET(request: NextRequest) {
  const userId = await verifyUserSession();
  if (!userId) {
    return NextResponse.json({ canReview: false, reason: "unauthorized" });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = parseInt(searchParams.get("productId") || "");
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const existing = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ canReview: false, reason: "already_reviewed" });
    }

    const userOrders = await db
      .select({ items: orders.items })
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

    return NextResponse.json({ canReview: purchased, reason: purchased ? "ok" : "not_purchased" });
  } catch (error) {
    console.error("Check review error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
