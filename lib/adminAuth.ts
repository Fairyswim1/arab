import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_session";

export function createAdminToken(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }

  return crypto.createHmac("sha256", password).update("admin-authenticated").digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return false;
  }

  if (password.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(expected)
  );
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  try {
    const expected = createAdminToken();
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export function unauthorizedResponse() {
  return Response.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
}
