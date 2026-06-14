import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sanitized = { ...body };
    delete sanitized.email;
    delete sanitized.phone;
    delete sanitized.password;
    delete sanitized.name;
    delete sanitized.address;
    console.error("CLIENT ERROR:", JSON.stringify(sanitized, null, 2));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
