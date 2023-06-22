const withNextRuntimeDotenv = require('next-runtime-dotenv')();

module.exports = withNextRuntimeDotenv({
  reactStrictMode: true,
  swcMinify: true,
  basePath: '/vaktor',
  assetPrefix: '/vaktor/',
});
