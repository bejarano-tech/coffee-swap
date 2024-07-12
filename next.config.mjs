/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.moralis.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
