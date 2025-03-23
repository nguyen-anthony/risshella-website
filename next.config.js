/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'careerlegacychallenge.risshella.com',
            },
          ],
          destination: '/sims4/careerlegacychallenge/:path*',
        },
      ],
    };
  },
}

module.exports = nextConfig 