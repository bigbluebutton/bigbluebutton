const { test } = require('../fixtures');
const { fullyParallel } = require('../playwright.config');
const { LearningDashboard } = require('./learningdashboard');
const c = require('../parameters/constants');
const { initializePages } = require('../core/helpers');

test.describe('Learning Dashboard', async () => {
  const learningDashboard = new LearningDashboard();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }) => {
    await initializePages(learningDashboard, browser, { createParameter: c.recordMeeting });
    await learningDashboard.getDashboardPage();
  });

  test('Check message', async() => {
    await learningDashboard.writeOnPublicChat();
  });

  test('User Time On Meeting', async() => {
    await learningDashboard.userTimeOnMeeting();
  });

  test('Polls', { tag: '@ci' }, async () => {
    await learningDashboard.initUserPage(true, learningDashboard.modPage.context, { isRecording: true });
    await learningDashboard.polls();
  });

  test('Basic Infos', { tag: '@ci' }, async () => {
    await learningDashboard.basicInfos();
  });
  
  test('Overview', { tag: '@ci' }, async () => {
    await learningDashboard.overview();
  });

  test('Download Session Learning Dashboard', { tag: '@ci' }, async ({}, testInfo) => {
    await learningDashboard.downloadSessionLearningDashboard(testInfo);
  });  
});
