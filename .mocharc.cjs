module.exports = {
  require: ['./test/setup-env.js', 'source-map-support/register'],
  file: ['./test/test-utils.ts'],
  timeout: 600000,
  bail: true,
  exit: true,
};
