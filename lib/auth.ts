/**
 * Optional gallery password protection.
 * Enabled when GALLERY_PASSWORD env var is set (non-empty).
 */

export const SESSION_COOKIE = "gallery_session";
const SESSION_PAYLOAD = "keuka-gallery-authenticated";

export function isAuthEnabled(): boolean {
  return Boolean(process.env.GALLERY_PASSWORD?.trim());
}

export function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.GALLERY_PASSWORD?.trim() ||
    ""
  );
}

/** Create HMAC session token (Edge-compatible via Web Crypto). */
export async function createSessionToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(SESSION_PAYLOAD)
  );
  return Buffer.from(signature).toString("base64url");
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token || !secret) return false;
  try {
    const expected = await createSessionToken(secret);
    return token === expected;
  } catch {
    return false;
  }
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.GALLERY_PASSWORD?.trim();
  if (!expected) return true;
  return input === expected;
}
