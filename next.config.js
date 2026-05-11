/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverExternalPackages: ['firebase-admin'],
  },
};

module.exports = nextConfig;
