const { toMatchImageSnapshot } = require('jest-image-snapshot');
const CustomParameters = require('../customparameters/customparameters');
const Multiusers = require('../user/multiusers');
const Polling = require('./poll');
const Page = require('../core/page');
const Poll = require('../chat/poll');
const ce = require('../customparameters/constants');
const { MAX_POLLING_TEST_TIMEOUT, TEST_DURATION_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)

expect.extend({ toMatchImageSnapshot });

const pollingTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_POLLING_TEST_TIMEOUT);
  });

  // Create Poll
  test('Create Poll', async () => {
    const test = new Polling();
    let response;
    let screenshot;
    try {
      const testName = 'createPoll';
      await test.logger('begin of ', testName);
      await test.init(true, testName);
      await test.startRecording(testName);
      response = await test.test(testName);
      await test.logger('end of ', testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(1.37, screenshot);
  }, TEST_DURATION_TIME);

  // Check for Poll Results chat message and return true when it appears
  test('Poll Results chat message', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'pollResultsChatMessage';
      await test.page3.logger('begin of ', testName);
      await test.initUser3(true, testName);
      await test.page3.startRecording(testName);
      response = await test.test(testName);
      await test.page3.logger('end of ', testName);
      await test.page3.stopRecording();
      screenshot = await test.page3.page.screenshot();
    } catch (err) {
      await test.page3.logger(err);
    } finally {
      await test.closePage(test.page3);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  }, TEST_DURATION_TIME);

  // This test spec sets the userdata-bbb_force_restore_presentation_on_new_events parameter to true
  // and checks that the viewers get the presentation restored forcefully when the Moderator zooms
  // publishes a poll result
  test('Force Restore Presentation On New Poll Result', async () => {
    const test = new CustomParameters();
    let response;
    let screenshot;
    try {
      const testName = 'forceRestorePresentationOnNewPollResult';
      await test.page1.logger('begin of ', testName);
      response = await test.forceRestorePresentationOnNewPollResult(ce.forceRestorePresentationOnNewEvents, testName);
      await test.page1.logger('end of ', testName);
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  }, TEST_DURATION_TIME);

  // This Test chooses randomly a polling case, runs it
  // and expects having it answered by the other user
  test('Random Poll', async () => {
    const test = new Multiusers();
    let response;
    let screenshot;
    try {
      const testName = 'randomPoll';
      await test.page1.logger('begin of ', testName);
      await test.init(testName);
      response = await test.randomPoll(testName);
      await test.page1.logger('end of ', testName);
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.5, screenshot);
  }, TEST_DURATION_TIME);
};
module.exports = exports = pollingTest;