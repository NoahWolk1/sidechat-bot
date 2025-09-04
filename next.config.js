/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Add compiler options
  compiler: {
    // Enables styled-components compatibility
    styledComponents: true,
  },
  // Configure output directory - 'standalone' for minimal serverless
  output: 'standalone',
}

module.exports = nextConfig
