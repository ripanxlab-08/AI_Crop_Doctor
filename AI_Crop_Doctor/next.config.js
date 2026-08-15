/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Prevents billing/build errors for static export/local image loads
  },
};

export default nextConfig;
