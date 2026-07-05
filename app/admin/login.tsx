"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function AdminLogin() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.refresh()
    } else {
      setError("Invalid password")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-teal flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-cream mb-2">Admin Access</h1>
          <p className="text-cream/50 text-sm">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-teal2 border border-gold/20 text-cream px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-cream/30"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold text-teal text-xs tracking-[0.3em] uppercase transition-colors hover:bg-gold2 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}
