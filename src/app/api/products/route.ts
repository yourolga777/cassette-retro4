import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { desc, eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");

  const conditions = [];
  if (category) conditions.push(eq(products.category, category as "blank" | "recorded" | "equipment"));
  if (brand) conditions.push(eq(products.brand, brand));

  const result = conditions.length > 0
    ? await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt))
    : await db.select().from(products).orderBy(desc(products.createdAt));

  return NextResponse.json(result);
}
