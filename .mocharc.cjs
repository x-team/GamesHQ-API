module.exports = {
  require: ['./test/setup-env.js', 'source-map-support/register'],
  file: ['./src/tests/integrationTestsUtils.ts'],
  timeout: 600000,
  bail: true,
  exit: true,
};
