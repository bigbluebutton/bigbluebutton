const base = require('@playwright/test');
const { CI } = require('./core/constants');

const testWithValidation = base.test.extend({
  sharedBeforeEachTestHook: [async ({ browser }, use) => {
    // Before test
    const { tags } = testWithValidation.info();
    const message = 'Skipping CI-only test';
    if (tags.includes('@ci-only') && !CI) {
      console.warn(message);
      testWithValidation.skip(true, message);
    }
    // Run test
    await use();
    // After test
    const contexts = browser.contexts();
    await Promise.all(contexts.map(context => context.close()));
  }, { scope: 'test', auto: true }],
});

exports.test = testWithValidation;
