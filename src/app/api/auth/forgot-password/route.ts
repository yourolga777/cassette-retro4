import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  return NextResponse.json({ message: "Если такой email зарегистрирован, мы отправили ссылку для сброса пароля." });
}
