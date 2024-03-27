const base = require('@playwright/test');
const { fullyParallel } = require('./playwright.config');

exports.test = base.test.extend({
  sharedEachTestHook: [ async ({ browser }, use) => {
    // before test
    await use();
    // after test
    if (fullyParallel) {
      while (browser.contexts().length > 0) {
        await browser.contexts()[0].close();
      }
    }
  }, { scope: 'test', auto: true }],
});
