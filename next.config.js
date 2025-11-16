/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dodo.ac',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'careerlegacychallenge.risshella.com',
          },
        ],
        destination: 'https://www.risshella.com/sims4/careerlegacychallenge/:path*',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig 