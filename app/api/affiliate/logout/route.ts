import { NextResponse } from "next/server"
import { AFFILIATE_COOKIE } from "@/lib/auth"

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/affiliate", process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"),
  )
  response.cookies.delete(AFFILIATE_COOKIE)
  return response
}
