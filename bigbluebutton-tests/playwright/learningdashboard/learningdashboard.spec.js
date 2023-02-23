const { test } = require('@playwright/test');
const { LearningDashboard } = require('./learningdashboard')

test.describe.parallel('Learning Dashboard', () => {
  test('Creating meeting', async ({ browser, context, page }) => {
    const learningDashboard = new LearningDashboard(browser, context);
    await learningDashboard.initModPage(page, true);
    await learningDashboard.initUserPage(true, context);
    await learningDashboard.createMeeting();
  });
});