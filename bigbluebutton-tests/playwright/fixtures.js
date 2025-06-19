const base = require('@playwright/test');
const { fullyParallel } = require('./playwright.config');
const { server, secret } = require('./core/parameters');

const testWithValidation = base.test.extend({
  sharedBeforeEachTestHook: [ async ({ browser }, use) => {
    // run test
    await use();
    // after test
    if (fullyParallel) {
      while (browser.contexts().length > 0) {
        await browser.contexts()[0].close();
      }
    }
  }, { scope: 'test', auto: true }],
});

// beforeAll hook validating environment variables set
testWithValidation.beforeAll(() => {
  const BBB_URL_PATTERN = /^https:\/\/[^\/]+\/bigbluebutton\/$/;

  if (!secret) throw new Error('BBB_SECRET environment variable is not set');
  if (!server) throw new Error('BBB_URL environment variable is not set');
  if (!BBB_URL_PATTERN.test(server)) throw new Error('BBB_URL must follow the pattern "https://DOMAIN_NAME/bigbluebutton/"');
});

exports.test = testWithValidation;
