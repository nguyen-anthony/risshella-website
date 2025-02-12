import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // This rule will match any path on the subdomain
        source: '/:path*',
        destination: '/sims4/careerlegacychallenge/:path*',
        has: [
          {
            type: 'host',
            value: 'careerlegacychallenge.risshella.com',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
