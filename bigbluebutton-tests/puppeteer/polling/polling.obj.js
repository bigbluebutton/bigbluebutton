const Page = require('../core/page');
const Poll = require('./poll');
const { closePages } = require('../core/util');
const { MAX_POLLING_TEST_TIMEOUT, TEST_DURATION_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const pollingTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_POLLING_TEST_TIMEOUT);
  });

  // Create Poll
  test('Create Poll', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'createPoll';
      await test.modPage.logger('begin of ', testName);
      await test.initModPage(true, testName);
      await test.modPage.startRecording(testName);
      response = await test.createPoll(testName);
      await test.modPage.logger('end of ', testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await test.modPage.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(1.37, screenshot);
  }, TEST_DURATION_TIME);

  // Create anonymous poll and check if its possible to see the user's response
  test('Create anonymous poll', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'pollAnonymous';
      await test.modPage.logger('begin of ', testName);
      await test.initPages(testName);
      await test.modPage.startRecording(testName);
      response = await test.pollAnonymous(testName);
      await test.modPage.logger('end of ', testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await closePages(test.modPage, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  }, TEST_DURATION_TIME);

  // Create quick poll
  test('Create quick poll - from the slide', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'createQuickPoll';
      await test.modPage.logger('begin of ', testName);
      await test.initPages(testName);
      await test.modPage.startRecording(testName);
      response = await test.quickPoll(testName);
      await test.modPage.logger('end of ', testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await closePages(test.modPage, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  }, TEST_DURATION_TIME);

  test('Create poll with user response', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'pollUserResponse';
      await test.modPage.logger('begin of ', testName);
      await test.initPages(testName);
      response = await test.pollUserResponse(testName);
      await test.modPage.logger('end of ', testName);
      await test.modPage.stopRecording();
      await test.userPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await closePages(test.modPage, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  }, TEST_DURATION_TIME);

  // Stop a poll manually
  test('Stop a poll manually', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'stopManuallyPoll';
      await test.modPage.logger('begin of ', testName);
      await test.initPages(testName);
      await test.modPage.startRecording(testName);
      response = await test.stopPoll(testName);
      await test.modPage.logger('end of ', testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await closePages(test.modPage, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  }, TEST_DURATION_TIME);

  // Check for Poll Results in chat message and return true when it appears
  test('Poll results in chat message', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'pollResultsInChatMessage';
      await test.modPage.logger('begin of ', testName);
      await test.initModPage(true, testName);
      await test.modPage.startRecording(testName);
      response = await test.pollResultsOnChat(testName);
      await test.modPage.logger('end of ', testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await test.modPage.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  }, TEST_DURATION_TIME);

  // Check for Poll Results on the whiteboard and return true when it appears
  test('Poll results on whiteboard', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'pollResultsOnWhiteboard';
      await test.modPage.logger('begin of ', testName);
      await test.initModPage(true, testName);
      await test.modPage.startRecording(testName);
      response = await test.pollResultsOnWhiteboard(testName);
      await test.modPage.logger('end of ', testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await test.modPage.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  }, TEST_DURATION_TIME);

  // Check for Poll Results in whiteboard and return true when it appears
  test('Poll results in a different presentation', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'pollResultsInDifferentPresentation';
      await test.modPage.logger('begin of ', testName);
      await test.initModPage(true, testName);
      await test.modPage.startRecording(testName);
      response = await test.pollResultsInDifferentPresentation(testName);
      await test.modPage.logger('end of ', testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await test.modPage.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  }, TEST_DURATION_TIME);

  // This test check all possible actions with
  // response choice: add, delete and edit
  test('Manage response choices', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'manageResponseChoices';
      await test.modPage.logger('begin of ', testName);
      await test.initPages(testName);
      response = await test.manageResponseChoices(testName);
      await test.modPage.logger('end of ', testName);
      await test.modPage.stopRecording();
      await test.userPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await closePages(test.modPage, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  }, TEST_DURATION_TIME);
};

module.exports = exports = pollingTest;