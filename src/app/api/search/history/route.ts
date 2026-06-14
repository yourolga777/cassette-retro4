import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { searchHistory } from "@/lib/schema";
import { verifyUserSession } from "@/lib/auth-user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const userId = await verifyUserSession();

    await db.insert(searchHistory).values({
      query: query.trim(),
      userId: userId || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save search history error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
