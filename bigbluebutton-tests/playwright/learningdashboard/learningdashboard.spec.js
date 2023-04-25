const { test } = require('@playwright/test');
const { LearningDashboard } = require('./learningdashboard');
const c = require('../customparameters/constants');

test.describe.serial('Learning Dashboard', async () => {
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

  test('User Time On Meeting', async() => {
    await learningDashboard.userTimeOnMeeting();
  });

  test('Polls', async ({ context }) => {
    await learningDashboard.initUserPage(true, context);
    await learningDashboard.polls();
  });

  test('Basic Infos', async () => {
    await learningDashboard.basicInfos();
  });

  test('Overview', async () => {
    await learningDashboard.overview();
  });

  test('Download Session Learning Dashboard', async ({ context }, testInfo) => {
    await learningDashboard.downloadSessionLearningDashboard(testInfo);
  });  
});
