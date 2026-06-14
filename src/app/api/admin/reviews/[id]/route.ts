import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewLikes, reviewReports } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifySession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const reviewId = parseInt(id);
    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [review] = await db
      .update(reviews)
      .set({ status, updatedAt: new Date() })
      .where(eq(reviews.id, reviewId))
      .returning();

    return NextResponse.json(review);
  } catch (error) {
    console.error("Admin update review error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifySession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const reviewId = parseInt(id);
    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    await db.delete(reviewLikes).where(eq(reviewLikes.reviewId, reviewId));
    await db.delete(reviewReports).where(eq(reviewReports.reviewId, reviewId));
    await db.delete(reviews).where(eq(reviews.id, reviewId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete review error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
