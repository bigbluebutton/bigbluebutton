import { initializePages } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { LearningDashboard } from './learningdashboard';

test.describe.parallel('Learning Dashboard', { tag: '@ci' }, () => {
  let learningDashboard: LearningDashboard;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    learningDashboard = new LearningDashboard(browser, context);
    await initializePages(learningDashboard, browser, { createParameter: c.recordMeeting, testInfo });
    await learningDashboard.getDashboardPage();
  });

  test('Check message', async () => {
    await learningDashboard.writeOnPublicChat();
  });

  test('User Time On Meeting', async () => {
    await learningDashboard.userTimeOnMeeting();
  });

  // eslint-disable-next-line no-empty-pattern
  test('Polls', { tag: '@flaky' }, async ({}, testInfo) => {
    await learningDashboard.initUserPage(learningDashboard.modPage.context, { isRecording: true, testInfo });
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
