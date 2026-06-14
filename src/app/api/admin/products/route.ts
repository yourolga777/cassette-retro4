import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.select().from(products).orderBy(desc(products.createdAt));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, price, category, brand, typeLabel, description, imageUrl, stockCount } = body;

    if (!name || !price || !category || !description || !imageUrl) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }

    const slug = slugify(name);
    const [existing] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "Товар с таким названием уже существует" }, { status: 409 });
    }

    const [product] = await db
      .insert(products)
      .values({
        name,
        slug,
        price: Number(price),
        category,
        brand: brand || null,
        typeLabel: typeLabel || null,
        description,
        imageUrl,
        stockCount: stockCount ? Number(stockCount) : 0,
      })
      .returning();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
