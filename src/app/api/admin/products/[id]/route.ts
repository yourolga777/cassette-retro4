import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { verifySession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, price, category, brand, typeLabel, description, imageUrl, stockCount } = body;

    const updateData: Record<string, unknown> = {};
    if (name) { updateData.name = name; updateData.slug = slugify(name); }
    if (price) updateData.price = Number(price);
    if (category) updateData.category = category;
    if (brand !== undefined) updateData.brand = brand;
    if (typeLabel !== undefined) updateData.typeLabel = typeLabel;
    if (description) updateData.description = description;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (stockCount !== undefined) updateData.stockCount = Number(stockCount);
    updateData.updatedAt = new Date();

    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, Number(id)))
      .returning();

    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await verifySession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await db.delete(products).where(eq(products.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
