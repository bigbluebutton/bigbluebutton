import { test as base } from '@playwright/test';

interface TestFixtures {
  sharedBeforeEachTestHook: void;
}

const testWithValidation = base.extend<TestFixtures>({
  sharedBeforeEachTestHook: [
    async ({ browser }, use) => {
      // Before test
      await use();
      // After test
      const contexts = browser.contexts();
      await Promise.all(contexts.map((context) => context.close()));
    },
    { scope: 'test', auto: true },
  ],
});

export const test = testWithValidation;
