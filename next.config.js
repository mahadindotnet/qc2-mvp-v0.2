/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress hydration warnings caused by browser extensions
  reactStrictMode: true,
  // Ignore ESLint errors during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // This helps with hydration mismatches from browser extensions
  experimental: {
    // suppressHydrationWarning: true, // This option is deprecated
  },
}

module.exports = nextConfig
