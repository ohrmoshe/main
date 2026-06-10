"use client"

import { useEffect } from "react"

// Captures a ?ref=CODE query param on landing and stores it in a cookie
// so it can be attributed to an affiliate when the visitor donates.
export function ReferralCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get("ref")
      if (ref) {
        const clean = ref.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40)
        if (clean) {
          // 60-day attribution window
          document.cookie = `ref_code=${clean}; path=/; max-age=${60 * 60 * 24 * 60}; SameSite=Lax`
        }
      }
    } catch {
      // no-op
    }
  }, [])

  return null
}
