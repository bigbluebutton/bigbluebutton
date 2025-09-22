const base = require('@playwright/test');

const testWithValidation = base.test.extend({
  sharedBeforeEachTestHook: [async ({ browser }, use) => {
    // Before test
    await use();
    // After test
    const contexts = browser.contexts();
    await Promise.all(contexts.map(context => context.close()));
  }, { scope: 'test', auto: true }],
});

exports.test = testWithValidation;
