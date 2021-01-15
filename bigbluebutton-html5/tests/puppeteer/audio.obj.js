const Audio = require('./audio/audio');
const Page = require('./core/page');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const audioTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Join audio with Listen Only', async () => {
    const test = new Audio();
    let response;
    let screenshot;
    try {
      await test.init(Page.getArgsWithAudio());
      response = await test.test();
      screenshot = await test.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Join audio with Microphone', async () => {
    const test = new Audio();
    let response;
    let screenshot;
    try {
      await test.init(Page.getArgsWithAudio());
      response = await test.microphone();
      screenshot = await test.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
      });
    }
  });
};

module.exports = exports = audioTest;
