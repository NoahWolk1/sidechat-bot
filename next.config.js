/** @type {import('next').NextConfig} */
const path = require('path');

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
  // Fix for workspace root warning
  outputFileTracingRoot: path.join(__dirname),
}

module.exports = nextConfig
