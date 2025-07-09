/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  output: 'standalone',
  transpilePackages: ["@humanui/ui", "@humanui/entities", "@humanui/utils", "@humanui/config"],
}

module.exports = nextConfig 