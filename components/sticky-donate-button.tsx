"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export function StickyDonateButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show after the user scrolls past the hero, hide when the donate section is in view.
    function onScroll() {
      const scrolled = window.scrollY > 500
      const donate = document.getElementById("donate")
      let inDonate = false
      if (donate) {
        const rect = donate.getBoundingClientRect()
        inDonate = rect.top < window.innerHeight && rect.bottom > 0
      }
      setVisible(scrolled && !inDonate)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 p-3.5 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-[120%]"
      }`}
      style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        href="#donate"
        className="flex items-center justify-center rounded-full px-7 py-4 text-base font-bold text-teal2 shadow-[0_10px_30px_rgba(18,54,54,0.35)]"
        style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))" }}
      >
        Donate &amp; Enter to Win
      </Link>
    </div>
  )
}
