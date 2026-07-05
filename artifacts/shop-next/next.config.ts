import type { NextConfig } from 'next';

const apiTarget = 'http://127.0.0.1:8080';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@workspace/api-client-react', '@workspace/shared'],
  // Replit's preview proxy serves the dev server from a different host than
  // localhost, so Next.js' dev-server origin check must be relaxed.
  allowedDevOrigins: ['*'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  // Workspace TS packages (e.g. @workspace/shared, @workspace/api-client-react)
  // use NodeNext-style ".js" extensions in imports for their .ts source files.
  // Webpack needs an explicit extension alias to resolve those imports.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      ...(config.resolve.extensionAlias ?? {}),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
