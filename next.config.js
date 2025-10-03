/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress hydration warnings caused by browser extensions
  reactStrictMode: true,
  // This helps with hydration mismatches from browser extensions
  experimental: {
    // suppressHydrationWarning: true, // This option is deprecated
  },
}

module.exports = nextConfig
