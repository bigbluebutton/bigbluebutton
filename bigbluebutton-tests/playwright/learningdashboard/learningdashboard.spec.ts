import { initializePages, linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { BreakoutLearningDashboard } from './breakoutLearningDashboard';
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

  // eslint-disable-next-line no-empty-pattern
  test('Shared Notes edits', async ({}, testInfo) => {
    linkIssue(25721);
    await learningDashboard.initUserPage(learningDashboard.modPage.context, { testInfo });
    await learningDashboard.editSharedNotes();
  });

  test('User Time On Meeting', async () => {
    await learningDashboard.userTimeOnMeeting();
  });

  // eslint-disable-next-line no-empty-pattern
  test('Polls', async ({}, testInfo) => {
    await learningDashboard.initUserPage(learningDashboard.modPage.context, { isRecording: true, testInfo });
    await learningDashboard.polls();
  });

  // eslint-disable-next-line no-empty-pattern
  test('Polls without a question are numbered in the order they were asked', async ({}, testInfo) => {
    linkIssue(25818);
    await learningDashboard.initUserPage(learningDashboard.modPage.context, { isRecording: true, testInfo });
    await learningDashboard.pollsWithoutQuestionNumbering();
  });

  // eslint-disable-next-line no-empty-pattern
  test('Quizzes without a question are numbered in the order they were asked', async ({}, testInfo) => {
    linkIssue(25818);
    await learningDashboard.initUserPage(learningDashboard.modPage.context, { isRecording: true, testInfo });
    await learningDashboard.quizzesWithoutQuestionNumbering();
  });

  // eslint-disable-next-line no-empty-pattern
  test('Session data lists polls in the order they were asked', async ({}, testInfo) => {
    linkIssue(25818);
    await learningDashboard.initUserPage(learningDashboard.modPage.context, { isRecording: true, testInfo });
    await learningDashboard.sessionDataPollsInCreationOrder();
  });

  test('Basic Infos', async () => {
    await learningDashboard.basicInfos();
  });

  test('Overview', async () => {
    await learningDashboard.overview();
  });

  test('Talk time', async () => {
    await learningDashboard.talkTime();
  });

  test('Download Session Learning Dashboard', async () => {
    await learningDashboard.downloadSessionLearningDashboard();
  });
});

test.describe.parallel('Learning Dashboard of a breakout room', { tag: '@ci' }, () => {
  test('Shows the activity of the room and keeps it after the room ends', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const dashboard = new BreakoutLearningDashboard(browser, context);
    await dashboard.initPages(page, testInfo);
    await dashboard.breakoutRoomHasItsOwnDashboard();
  });
});
