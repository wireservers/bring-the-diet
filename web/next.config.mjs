import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../'),
  // Next's runtime require-hook does a dynamic `require('styled-jsx/package.json')`
  // that the file tracer can't see in pnpm monorepos, so the standalone bundle
  // ships without styled-jsx and crashes on startup. Force it into the trace.
  outputFileTracingIncludes: {
    '**/*': [
      '../node_modules/styled-jsx/**/*',
      '../node_modules/@swc/helpers/**/*',
    ],
  },
  reactStrictMode: true,
  transpilePackages: ['@bringthediet/ui', '@bringthediet/shared'],
  // Canonical-host 301: apex -> www. The API only allow-lists the www origin
  // for CORS, so apex visitors otherwise get a "Failed to fetch" on every
  // credentialed call. Keeps path + query via the :path* splat.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'bringthediet.com' }],
        destination: 'https://www.bringthediet.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
