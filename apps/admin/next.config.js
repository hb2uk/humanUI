/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ["@humanui/ui", "@humanui/entities", "@humanui/utils", "@humanui/config"],
}

module.exports = nextConfig 