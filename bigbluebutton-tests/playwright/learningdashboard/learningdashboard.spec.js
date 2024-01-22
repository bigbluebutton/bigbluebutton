const { test } = require('@playwright/test');
const { fullyParallel } = require('../playwright.config');
const { LearningDashboard } = require('./learningdashboard');
const c = require('../parameters/constants');
const { initializePages } = require('../core/helpers');

test.describe('Learning Dashboard', async () => {
  const learningDashboard = new LearningDashboard();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }) => {
    const { context } = await initializePages(learningDashboard, browser, { createParameter: c.recordMeeting });
    await learningDashboard.getDashboardPage(context);
  });

  test('Check message', async() => {
    await learningDashboard.writeOnPublicChat();
  });

  test('User Time On Meeting', async() => {
    await learningDashboard.userTimeOnMeeting();
  });

  test('Polls @ci', async ({ browserName, context }) => {
    test.skip(browserName === 'webkit', "Failed to load the plugin pw")
    await learningDashboard.initUserPage(true, context, { isRecording: true });
    await learningDashboard.polls();
  });

  test('Basic Infos @ci', async () => {
    await learningDashboard.basicInfos();
  });

  test('Overview', async ({ browserName }) => {
    test.skip(browserName === 'webkit', "Webcam not supported on Webkit")
    await learningDashboard.overview();
  });

  test('Download Session Learning Dashboard @ci', async ({ context }, testInfo) => {
    await learningDashboard.downloadSessionLearningDashboard(testInfo);
  });  
});
