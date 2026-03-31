/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['@bringthediet/ui', '@bringthediet/shared'],
};

export default nextConfig;
