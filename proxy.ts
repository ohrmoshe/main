import { NextRequest, NextResponse } from "next/server"

// FIX (#1): defense-in-depth guard over /admin. The authoritative check is requireAdmin() inside
// each server action; this blocks unauthenticated NON-GET requests (i.e. server-action POSTs) to
// /admin at the edge before they ever run. GET is allowed so the login page can render.
// Verification mirrors lib/auth.ts but uses Web Crypto (Edge runtime has no node:crypto).
// (Next 16 "proxy" convention — formerly "middleware".)

const ADMIN_COOKIE = "admin_auth"

function toBase64Url(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function isValidToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) return false
  const dot = token.indexOf(".")
  if (dot < 1) return false
  const payload = token.slice(0, dot)
  const mac = token.slice(dot + 1)
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
  if (diff !== 0) return false
  const exp = Number(payload)
  return Number.isFinite(exp) && exp > Math.floor(Date.now() / 1000)
}

export async function proxy(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD") return NextResponse.next()
  const secret = process.env.BETTER_AUTH_SECRET || process.env.ADMIN_PASSWORD || ""
  const ok = await isValidToken(req.cookies.get(ADMIN_COOKIE)?.value, secret)
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.next()
}

export const config = { matcher: ["/admin", "/admin/:path*"] }
