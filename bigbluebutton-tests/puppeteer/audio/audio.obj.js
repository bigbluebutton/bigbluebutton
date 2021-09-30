const Audio = require('./audio');
const Page = require('../core/page');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_AUDIO_TEST_TIMEOUT } = require('../core/constants');

expect.extend({ toMatchImageSnapshot });

const audioTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_AUDIO_TEST_TIMEOUT);
  });

  test('Join audio with Listen Only', async () => {
    const test = new Audio();
    let response;
    let screenshot;
    try {
      const testName = 'joinWithListenOnly';
      await test.logger('begin of ', testName);
      await test.init(true, false, testName);
      await test.startRecording(testName);
      response = await test.test();
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.65, screenshot);
  });

  test('Join audio with Microphone', async () => {
    const test = new Audio();
    let response;
    let screenshot;
    try {
      const testName = 'joinWithMicrophone';
      await test.logger('begin of ', testName);
      await test.init(true, false, testName);
      await test.startRecording(testName);
      response = await test.microphone();
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.52, screenshot);
  });
};

module.exports = exports = audioTest;
