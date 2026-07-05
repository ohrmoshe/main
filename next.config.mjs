/** @type {import('next').NextConfig} */
const nextConfig = {
  // FIX (#7): type errors now fail the build instead of shipping silently (tsc passes clean).
  images: {
    unoptimized: true,
  },
  // Security headers help browsers and corporate/network filters trust the site
  // and reduce "potential risk / unsafe site" warnings.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // FIX (#6): Content-Security-Policy. 'unsafe-inline' is required because Next.js injects
            // inline scripts/styles without nonces; a nonce-based strict CSP is a future hardening.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://js.stripe.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
              "connect-src 'self' https://api.stripe.com https://va.vercel-scripts.com",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig
