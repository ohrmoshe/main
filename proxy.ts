import { NextRequest, NextResponse } from "next/server"

// FIX (#1): defense-in-depth guard over /admin. The authoritative check is requireAdmin() inside
// each server action; this blocks unauthenticated NON-GET requests (i.e. server-action POSTs) to
// /admin at the edge before they ever run. GET is allowed so the login page can render.
// Verification mirrors lib/auth.ts but uses Web Crypto (Edge runtime has no node:crypto).
// (Next 16 "proxy" convention — formerly "middleware".)

const ADMIN_COOKIE = "admin_auth"
const AFFILIATE_COOKIE = "affiliate_auth"

function toBase64Url(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

// Verify an HMAC-signed "<payload>.<mac>" token against the secret (constant-time-ish).
async function verifyMac(payload: string, mac: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  const expected = toBase64Url(new Uint8Array(sig))
  if (mac.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < mac.length; i++) diff |= mac.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

// Admin token: "<expiry>.<mac>"
async function isValidAdminToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) return false
  const dot = token.indexOf(".")
  if (dot < 1) return false
  const payload = token.slice(0, dot)
  const mac = token.slice(dot + 1)
  if (!(await verifyMac(payload, mac, secret))) return false
  const exp = Number(payload)
  return Number.isFinite(exp) && exp > Math.floor(Date.now() / 1000)
}

// Affiliate token: "<code>.<expiry>.<mac>"
async function isValidAffiliateToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) return false
  const lastDot = token.lastIndexOf(".")
  if (lastDot < 1) return false
  const payload = token.slice(0, lastDot)
  const mac = token.slice(lastDot + 1)
  if (!(await verifyMac(payload, mac, secret))) return false
  const sep = payload.lastIndexOf(".")
  if (sep < 1) return false
  const exp = Number(payload.slice(sep + 1))
  return Number.isFinite(exp) && exp > Math.floor(Date.now() / 1000)
}

export async function proxy(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD") return NextResponse.next()
  const secret = process.env.BETTER_AUTH_SECRET || process.env.ADMIN_PASSWORD || ""

  const ok = req.nextUrl.pathname.startsWith("/affiliate")
    ? await isValidAffiliateToken(req.cookies.get(AFFILIATE_COOKIE)?.value, secret)
    : await isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value, secret)

  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.next()
}

export const config = { matcher: ["/admin", "/admin/:path*", "/affiliate", "/affiliate/:path*"] }
