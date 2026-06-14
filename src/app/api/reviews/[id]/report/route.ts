import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewReports } from "@/lib/schema";
import { verifyUserSession } from "@/lib/auth-user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyUserSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const reviewId = parseInt(id);
    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;
    if (!reason) {
      return NextResponse.json({ error: "Укажите причину жалобы" }, { status: 400 });
    }

    await db.insert(reviewReports).values({ reviewId, userId, reason });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Report review error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
