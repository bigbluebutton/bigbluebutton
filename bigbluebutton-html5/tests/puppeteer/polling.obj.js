const CustomParameters = require('./customparameters/customparameters');
const Multiusers = require('./user/multiusers');
const Polling = require('./polling/poll');
const Page = require('./core/page');
const Poll = require('./chat/poll');
const ce = require('./customparameters/constants');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_POLLING_TEST_TIMEOUT } = require('./core/constants'); // core constants (Timeouts vars imported)

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
      await test.init(Page.getArgs(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      await test.closeAudioModal();
      response = await test.test();
      await test.logger('end of ', testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
    } catch (e) {
      await test.logger(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 1.37,
        failureThresholdType: 'percent',
      });
    }
  });

  // Check for Poll Results chat message and return true when it appears
  test('Poll Results chat message', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'pollResultsChatMessage';
      await test.page3.logger('begin of ', testName);
      await test.initUser3(Page.getArgs(), undefined, testName);
      await test.page3.startRecording(testName);
      response = await test.test(testName);
      await test.page3.logger('end of ', testName);
      await test.page3.stopRecording();
      screenshot = await test.page3.page.screenshot();
    } catch (e) {
      await test.page3.logger(e);
    } finally {
      await test.closePage(test.page3);
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });

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
      response = await test.forceRestorePresentationOnNewPollResult(Page.getArgs(), undefined, `${ce.forceRestorePresentationOnNewEvents}`, testName);
      await test.page1.logger('end of ', testName);
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (e) {
      await test.page1.logger(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.5,
        failureThresholdType: 'percent',
      });
    }
  });

  // This Test chooses randomly a polling case, runs it
  // and expects having it answered by the other user
  test('Random Poll', async () => {
    const test = new Multiusers();
    let response;
    let screenshot;
    try {
      const testName = 'randomPoll';
      await test.page1.logger('begin of ', testName);
      await test.init(undefined, testName);
      response = await test.randomPoll(testName);
      await test.page1.logger('end of ', testName);
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (e) {
      await test.page1.logger(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.5,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = pollingTest;
