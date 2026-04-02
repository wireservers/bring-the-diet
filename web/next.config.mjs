import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../'),
  reactStrictMode: true,
  transpilePackages: ['@bringthediet/ui', '@bringthediet/shared'],
};

export default nextConfig;
