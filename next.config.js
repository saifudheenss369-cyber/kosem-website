/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['firebase-admin'],
};

module.exports = nextConfig;
