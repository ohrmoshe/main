import "server-only"
import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "node:crypto"

// Admin session handling.
// FIX (#3): the session cookie is no longer the plaintext password — it is a short, HMAC-signed
// token that carries only an expiry. The password is verified with a constant-time comparison.
// FIX (#1/#10/#11): requireAdmin() is called at the top of every privileged server action.

export const ADMIN_COOKIE = "admin_auth"
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, in seconds

function signingSecret(): string {
  const s = process.env.BETTER_AUTH_SECRET || process.env.ADMIN_PASSWORD
  if (!s) throw new Error("No admin session signing secret configured (set BETTER_AUTH_SECRET).")
  return s
}

function hmac(message: string): string {
  return createHmac("sha256", signingSecret()).update(message).digest("base64url")
}

// Token format: "<expiryEpochSeconds>.<hmac(expiry)>"
export function createAdminSessionToken(): string {
  const payload = String(Math.floor(Date.now() / 1000) + ADMIN_COOKIE_MAX_AGE)
  return `${payload}.${hmac(payload)}`
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  if (!token) return false
  const dot = token.indexOf(".")
  if (dot < 1) return false
  const payload = token.slice(0, dot)
  const mac = token.slice(dot + 1)
  const macBuf = Buffer.from(mac)
  const expBuf = Buffer.from(hmac(payload))
  if (macBuf.length !== expBuf.length || !timingSafeEqual(macBuf, expBuf)) return false
  const exp = Number(payload)
  return Number.isFinite(exp) && exp > Math.floor(Date.now() / 1000)
}

export function verifyAdminPassword(submitted: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD || ""
  if (!expected || typeof submitted !== "string") return false
  const a = Buffer.from(submitted)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false // length is not secret enough to protect; rate limiting covers brute force
  return timingSafeEqual(a, b)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return isValidAdminToken(store.get(ADMIN_COOKIE)?.value)
}

/** Throws if the caller is not an authenticated admin. Call at the top of every privileged server action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized: admin authentication required.")
  }
}

// --- Donor self-service cancellation (FIX #2) ---
// A short-lived, signed token proving the holder controls a specific donor email. Emailed as a magic
// link so cancellation requires email ownership instead of just knowing the address.
const CANCEL_TOKEN_TTL = 30 * 60 // 30 minutes, in seconds

export function createCancelToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + CANCEL_TOKEN_TTL }),
  ).toString("base64url")
  return `${payload}.${hmac(payload)}`
}

export function verifyCancelToken(token: string | undefined | null): string | null {
  if (!token) return null
  const dot = token.indexOf(".")
  if (dot < 1) return null
  const payload = token.slice(0, dot)
  const mac = token.slice(dot + 1)
  const macBuf = Buffer.from(mac)
  const expBuf = Buffer.from(hmac(payload))
  if (macBuf.length !== expBuf.length || !timingSafeEqual(macBuf, expBuf)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    if (typeof data?.email !== "string" || typeof data?.exp !== "number") return null
    if (data.exp <= Math.floor(Date.now() / 1000)) return null
    return data.email
  } catch {
    return null
  }
}
