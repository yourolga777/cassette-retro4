import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  return NextResponse.json({ message: "Пароль изменён. (Заглушка — реальная отправка ещё не подключена)" });
}
