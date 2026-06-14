import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

function getSecret(): Uint8Array {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET не задан в .env");
  return new TextEncoder().encode(s);
}

const COOKIE_NAME = "user_session";

export async function createUserSession(userId: number): Promise<string> {
  const token = await new SignJWT({ userId, role: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());
  return token;
}

export async function verifyUserSession(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = await jwtVerify(token, getSecret());
    const userId = payload.payload.userId as number;
    return userId ?? null;
  } catch {
    return null;
  }
}

export function setUserSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`;
}

export function clearUserSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
