import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Stops this site being framed by others.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Only capabilities the site genuinely never uses.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
]

// NOTE: no Content-Security-Policy here on purpose. The site loads Google
// Fonts, Google Analytics and Vercel Analytics, so a CSP needs a
// report-only rollout against real traffic before it can be enforced.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
