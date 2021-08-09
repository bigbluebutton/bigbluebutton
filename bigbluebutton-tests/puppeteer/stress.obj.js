const { toMatchImageSnapshot } = require('jest-image-snapshot');
const Stress = require('./stress/stress.js');

expect.extend({ toMatchImageSnapshot });

const stressTest = () => {
  // First moderator to join the meeting should be the presenter
  test('First moderator joining as presenter', async () => {
    const test = new Stress();
    let response;
    try {
      const testName = 'firstModeratorAsPresenter';
      await test.logger('begin of ', testName);
      await test.startRecording(testName);
      response = await test.moderatorAsPresenter(testName);
      await test.logger('end of ', testName);
      await test.stopRecording();
    } catch (e) {
      await test.logger(e);
    }
    expect(response).toBe(true);
    // await Page.checkRegression(2.0);
  });
};

module.exports = exports = stressTest;