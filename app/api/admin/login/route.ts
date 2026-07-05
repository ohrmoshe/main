import { NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword, createAdminSessionToken, ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // FIX (#4): rate limit by client IP to stop brute-force password guessing.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rl = checkRateLimit(`admin-login:${ip}`)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    )
  }

  let password: unknown
  try {
    ;({ password } = await request.json())
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  // FIX (#3): constant-time password check; on success set a signed session token (NOT the password).
  if (verifyAdminPassword(password)) {
    const response = NextResponse.json({ success: true })
    response.cookies.set(ADMIN_COOKIE, createAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ADMIN_COOKIE_MAX_AGE,
      path: "/",
    })
    return response
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 })
}
