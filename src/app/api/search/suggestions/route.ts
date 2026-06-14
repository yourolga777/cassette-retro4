import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchTerm = `%${q}%`;

    const nameSuggestions = await db
      .select({ name: products.name, slug: products.slug })
      .from(products)
      .where(sql`${products.name} ILIKE ${searchTerm}`)
      .limit(5);

    const brandSuggestions = await db
      .select({ name: products.brand })
      .from(products)
      .where(sql`${products.brand} ILIKE ${searchTerm}`)
      .limit(3);

    const uniqueBrands = [...new Set(brandSuggestions.map((b) => b.name).filter(Boolean))];

    return NextResponse.json({
      suggestions: {
        names: nameSuggestions,
        brands: uniqueBrands,
      },
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
