await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding');
    return config;
  },
};
export default config;
