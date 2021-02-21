const CustomParameters = require('./customparameters/customparameters');
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
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
      await test.logger('end of ', testName);
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
      await test.initUser3(Page.getArgs(), undefined);
      response = await test.test(testName);
      await test.page3.logger('end of ', testName);
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
      response = await test.forceRestorePresentationOnNewPollResult(testName, Page.getArgs(), undefined, `${ce.forceRestorePresentationOnNewEvents}`);
      await test.page1.logger('end of ', testName);
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
