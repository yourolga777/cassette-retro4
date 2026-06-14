import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const category = searchParams.get("category");

    if (!q) {
      return NextResponse.json({ products: [], totalCount: 0, page, limit });
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${q}%`;
    const conditions = [];

    conditions.push(
      sql`(${products.name} ILIKE ${searchTerm} OR ${products.brand} ILIKE ${searchTerm} OR ${products.description} ILIKE ${searchTerm})`
    );

    if (minPrice) {
      conditions.push(sql`${products.price} >= ${parseInt(minPrice)}`);
    }
    if (maxPrice) {
      conditions.push(sql`${products.price} <= ${parseInt(maxPrice)}`);
    }
    if (inStock === "true") {
      conditions.push(sql`${products.stockCount} > 0`);
    }
    if (category) {
      conditions.push(sql`${products.category} = ${category}`);
    }

    const whereClause = conditions.length === 1
      ? conditions[0]
      : sql`(${sql.join(conditions, sql` AND `)})`;

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(products)
      .where(whereClause);

    const totalCount = countResult?.count ?? 0;

    const found = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(
        sql`CASE WHEN ${products.name} ILIKE ${q} THEN 0 ELSE 1 END`,
        desc(products.createdAt)
      )
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ products: found, totalCount, page, limit });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
