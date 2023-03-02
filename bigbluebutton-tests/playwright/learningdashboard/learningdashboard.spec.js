const { test } = require('@playwright/test');
const { LearningDashboard } = require('./learningdashboard');
const c = require('../customparameters/constants');

test.describe('Learning Dashboard', async () => {

  const learningDashboard = new LearningDashboard();
  test.beforeAll(async ({ browser }) => {

    const context = await browser.newContext();
    const page = await context.newPage();
    
    await learningDashboard.initModPage(page, true,  { customParameter: c.recordMeeting });
    
    await learningDashboard.getDashboardPage(context);
  });

  test('Check message', async() => {
    await learningDashboard.writeOnPublicChat();
  });

  test('Meeting Duration Time', async() => {
    await learningDashboard.meetingDurationTime();
  });

  test('Polls test', async() => {
    await learningDashboard.initUserPage1(true);
    await learningDashboard.pollsTest();
  });

  test.only('Basic Info', async() => {
    await learningDashboard.basicInfos();
  });
})