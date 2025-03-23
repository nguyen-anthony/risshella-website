/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'careerlegacychallenge.risshella.com',
          },
        ],
        destination: 'https://www.risshella.com/sims4/careerlegacychallenge',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig 