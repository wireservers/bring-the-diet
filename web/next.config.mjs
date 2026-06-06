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
};

export default nextConfig;
