const { test } = require('../fixtures');
const { LearningDashboard } = require('./learningdashboard');
const c = require('../parameters/constants');
const { initializePages } = require('../core/helpers');

test.describe.parallel('Learning Dashboard', { tag: '@ci' } , async () => {
  const learningDashboard = new LearningDashboard();

  test.beforeEach(async ({ browser }, testInfo) => {
    await initializePages(learningDashboard, browser, { createParameter: c.recordMeeting, testInfo });
    await learningDashboard.getDashboardPage();
  });

  test('Check message', async() => {
    await learningDashboard.writeOnPublicChat();
  });

  test('User Time On Meeting', async() => {
    await learningDashboard.userTimeOnMeeting();
  });

  test('Polls', { tag: '@flaky' }, async ({}, testInfo) => {
    await learningDashboard.initUserPage(true, learningDashboard.modPage.context, { isRecording: true, testInfo });
    await learningDashboard.polls();
  });

  test('Basic Infos', async () => {
    await learningDashboard.basicInfos();
  });

  test('Overview', async () => {
    await learningDashboard.overview();
  });

  test('Download Session Learning Dashboard', async () => {
    await learningDashboard.downloadSessionLearningDashboard();
  });  
});
