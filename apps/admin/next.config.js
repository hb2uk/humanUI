/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    typedRoutes: false,
  },
  output: 'standalone',
  transpilePackages: ["@humanui/ui", "@humanui/entities", "@humanui/utils", "@humanui/config", "@humanui/constants"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({ '@prisma/client': '@prisma/client' });
      config.plugins.push(
        new (require('webpack').DefinePlugin)({
          'process.env.PRISMA_QUERY_ENGINE_TYPE': JSON.stringify('binary'),
        })
      );
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = nextConfig 