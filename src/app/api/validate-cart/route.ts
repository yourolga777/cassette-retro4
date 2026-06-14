import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Pustaya korzina" }, { status: 400 });
    }

    const ids = items.map((i: { id: number }) => i.id);
    const dbProducts = await db
      .select({ id: products.id, name: products.name, price: products.price, stockCount: products.stockCount })
      .from(products)
      .where(inArray(products.id, ids));

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    const updates: Array<{ id: number; name: string; oldPrice: number; newPrice: number; available: boolean }> = [];

    for (const item of items) {
      const dbItem = productMap.get(item.id);
      if (!dbItem) {
        updates.push({ id: item.id, name: item.name, oldPrice: item.price, newPrice: 0, available: false });
      } else {
        if (dbItem.price !== item.price) {
          updates.push({ id: item.id, name: dbItem.name, oldPrice: item.price, newPrice: dbItem.price, available: true });
        }
        if ((dbItem.stockCount ?? 0) <= 0) {
          updates.push({ id: item.id, name: dbItem.name, oldPrice: item.price, newPrice: item.price, available: false });
        }
      }
    }

    if (updates.length > 0) {
      return NextResponse.json({ valid: false, updates });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Validate cart error:", error);
    return NextResponse.json({ valid: false, error: "Vnutrennyaya oshibka servera" }, { status: 500 });
  }
}
