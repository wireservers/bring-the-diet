/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@bringthediet/ui', '@bringthediet/shared'],
};

export default nextConfig;
