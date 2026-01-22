/** @type {import('next').NextConfig} */
const nextConfig = {
  // Commented out for local development
  // output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
