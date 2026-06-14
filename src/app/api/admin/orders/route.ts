import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { desc, eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const paymentMethod = searchParams.get("paymentMethod");
  const status = searchParams.get("status");

  const conditions = [];
  if (paymentMethod === "card" || paymentMethod === "cash") {
    conditions.push(eq(orders.paymentMethod, paymentMethod as "card" | "cash"));
  }
  if (status === "pending" || status === "paid" || status === "failed" || status === "refunded" || status === "cancelled") {
    conditions.push(eq(orders.status, status));
  }

  const result = await db
    .select()
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));

  return NextResponse.json(result);
}
