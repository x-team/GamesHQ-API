const chai = require('chai');
chai.use(require('sinon-chai'));

// Overwrite all env variables set by AWS for testing purposes
// https://www.npmjs.com/package/dotenv#what-happens-to-environment-variables-that-were-already-set
const dotenv = require('dotenv');
const { parsed } = dotenv.config({ path: '.env.dev' });
for (const k in parsed) {
  process.env[k] = parsed[k];
}

require('ts-node').register({
  project: './tsconfig.json',
  transpileOnly: true,
});
