const { test } = require('../fixtures');
const { LearningDashboard } = require('./learningdashboard');
const c = require('../parameters/constants');
const { initializePages } = require('../core/helpers');

test.describe.parallel('Learning Dashboard', { tag: '@ci' } , async () => {
  const learningDashboard = new LearningDashboard();

  test.beforeEach(async ({ browser }) => {
    await initializePages(learningDashboard, browser, { createParameter: c.recordMeeting });
    await learningDashboard.getDashboardPage();
  });

  test('Check message', async() => {
    await learningDashboard.writeOnPublicChat();
  });

  test('User Time On Meeting', async() => {
    await learningDashboard.userTimeOnMeeting();
  });

  test('Polls', { tag: '@flaky' }, async () => {
    await learningDashboard.initUserPage(true, learningDashboard.modPage.context, { isRecording: true });
    await learningDashboard.polls();
  });

  test('Basic Infos', async () => {
    await learningDashboard.basicInfos();
  });

  test('Overview', async () => {
    await learningDashboard.overview();
  });

  test('Download Session Learning Dashboard', async ({}, testInfo) => {
    await learningDashboard.downloadSessionLearningDashboard(testInfo);
  });  
});
