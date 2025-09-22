const { test } = require('../fixtures');
const { fullyParallel } = require('../playwright.config');
const { Polling } = require('./poll');
const { initializePages } = require('../core/helpers');

test.describe('Polling', { tag: '@ci' }, async () => {
  const polling = new Polling();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }, testInfo) => {
    await initializePages(polling, browser, { isMultiUser: true, testInfo });
  });

  // Manage
  test('Create poll', async () => {
    await polling.createPoll();
  });

  test('Create anonymous poll', async () => {
    await polling.pollAnonymous();
  });

  test('Create quick poll - from the slide', async () => {
    await polling.quickPoll();
  });

  test('Create poll with user response', async () => {
    await polling.pollUserResponse();
  });

  test('Stop a poll manually', async () => {
    await polling.stopPoll();
  });

  test('Manage response choices', async () => {
    await polling.manageResponseChoices();
  });

  test('Start a poll without presentation', async () => {
    await polling.startPollWithoutPresentation();
  });

  test('Custom input', async () => {
    await polling.customInput();
  });

  test('Allow multiple choices', async () => {
    await polling.allowMultipleChoices();
  });

  test('Smart slides questions', async () => {
    await polling.smartSlidesQuestions();
  });

  // Results
  test('Poll results in chat message', async () => {
    await polling.pollResultsOnChat();
  });

  test('Poll results on whiteboard', async () => {
    await polling.pollResultsOnWhiteboard();
  });

  test('Poll results in a different presentation', async ({}, testInfo) => {
    test.fixme(!testInfo.config.fullyParallel, 'Currently only works in parallel mode. Poll results not being displayed in the presentation');
    await polling.pollResultsInDifferentPresentation();
  });
});
