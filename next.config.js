/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Correct key for Next.js 13.x (serverExternalPackages was being ignored)
    serverComponentsExternalPackages: ['firebase-admin', 'razorpay', '@prisma/client', 'prisma'],
  },
};

module.exports = nextConfig;
