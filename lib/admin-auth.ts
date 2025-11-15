const COOKIE_SALT = "scanminers-admin-v1";
export const ADMIN_COOKIE_NAME = "scanminers-admin";

async function hashString(secret: string): Promise<string> {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error("Web Crypto API is not available in this runtime");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(`${COOKIE_SALT}:${secret}`);
  const digest = await cryptoObj.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function deriveAdminToken(passphrase: string): Promise<string> {
  return hashString(passphrase);
}

export async function validateAdminToken(token: string | undefined | null, passphrase: string): Promise<boolean> {
  if (!token) return false;
  const expected = await deriveAdminToken(passphrase);
  return token === expected;
}
