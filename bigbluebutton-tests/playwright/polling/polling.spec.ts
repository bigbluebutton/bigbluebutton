import { initializePages } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { Polling } from './poll';

test.describe.parallel('Polling', { tag: '@ci' }, () => {
  let polling: Polling;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    polling = new Polling(browser, context);
    await initializePages(polling, browser, { isMultiUser: true, testInfo });
  });

  test.describe('Manage', () => {
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
  });

  test.describe('Results', () => {
    test('Poll results in chat message', async () => {
      await polling.pollResultsOnChat();
    });

    test('Poll results on whiteboard', async () => {
      await polling.pollResultsOnWhiteboard();
    });

    test('Poll results in a different presentation', async () => {
      await polling.pollResultsInDifferentPresentation();
    });
  });

  test.describe('Smart Slides', () => {
    test('A/B/C/D/E - One option answer', async () => {
      await polling.oneOptionAnswer();
    });

    test('Multiple Choices - Two question marks', async () => {
      await polling.twoQuestionMarks();
    });

    test('True/False', async () => {
      await polling.trueFalse();
    });

    test('Yes/No', async () => {
      await polling.yesNo();
    });

    test('Type Response', async () => {
      await polling.typeResponse();
    });

    test('Hiding pools - Poll anywhere in the slide', async () => {
      await polling.pollAnywhereSlide();
    });

    test('Hiding poll - white box', async () => {
      await polling.whiteBox();
    });
  });
});
