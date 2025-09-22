const base = require('@playwright/test');
const { fullyParallel } = require('./playwright.config');
const fs = require('fs');
const path = require('path');

// Logs management functions
function initializeLogsFolder() {
  const logsDir = path.join(__dirname, 'logs');

  if (fs.existsSync(logsDir)) {
    fs.rmSync(logsDir, { recursive: true, force: true });
  }

  fs.mkdirSync(logsDir, { recursive: true });
}

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
