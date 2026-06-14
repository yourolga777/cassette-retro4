import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  return NextResponse.json(result);
}
