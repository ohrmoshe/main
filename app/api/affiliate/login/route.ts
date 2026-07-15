import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { affiliates } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import {
  verifyAffiliatePassword,
  createAffiliateSessionToken,
  AFFILIATE_COOKIE,
  AFFILIATE_COOKIE_MAX_AGE,
} from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Rate limit by client IP to blunt brute-force guessing.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rl = checkRateLimit(`affiliate-login:${ip}`)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    )
  }

  let code: unknown
  let password: unknown
  try {
    ;({ code, password } = await request.json())
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (typeof code !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const normalizedCode = code.trim().toLowerCase()
  const [affiliate] = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.code, normalizedCode))
    .limit(1)

  // Same generic error whether the code or the password is wrong.
  if (!affiliate || !verifyAffiliatePassword(password, affiliate.passwordHash)) {
    return NextResponse.json({ error: "Invalid access code or password" }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(AFFILIATE_COOKIE, createAffiliateSessionToken(affiliate.code), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: AFFILIATE_COOKIE_MAX_AGE,
    path: "/",
  })
  return response
}
