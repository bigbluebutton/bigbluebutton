const { test } = require('@playwright/test');
const { LearningDashboard } = require('./learningdashboard');

test.describe('Learning Dashboard', async () => {

  const learningDashboard = new LearningDashboard();
  test.beforeAll(async ({ browser }) => {

    const context = await browser.newContext();
    const page = await context.newPage();
    
    await learningDashboard.initModPage(page, true);
    await learningDashboard.getDashboardPage(context);
  });

  test('Check message', async() => {
    await learningDashboard.writeOnPublicChat();
  });

  test('Meeting Duration Time', async() => {
    await learningDashboard.meetingDurationTime();
  });
})