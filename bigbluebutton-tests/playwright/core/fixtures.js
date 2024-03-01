const base = require('@playwright/test');
const { fullyParallel } = require('../playwright.config');
const { initializePages } = require('./helpers');

module.exports = base.test.extend({
  sharedBeforeAll: [ async ({}, use) => {
    console.log('Before All');
    if (!fullyParallel) {
      const { context } = await initializePages(chat, browser, { isMultiUser: true });
      testContext = context;
    }
    await use();
    console.log('After All');
  }, { scope: 'worker', auto: true } ],

  sharedBeforeEach: [ async ({ context }, use) => {
    if (fullyParallel) {
      const { context: innerContext } = await initializePages(chat, browser, { isMultiUser: true });
      testContext = innerContext;
    }
    console.log('Before Each');
    await use();
    if (fullyParallel) {
      console.log(`contexts size: ${context.browser.contexts().length}`)
      await context.browser.contexts()[0].close();
    }
    console.log('After Each');
  }, { scope: 'test', auto: true } ],
});
