const Stress = require('./stress/stress.js');

const stressTest = () => {
  // First moderator to join the meeting should be the presenter
  test('First moderator joining as presenter', async () => {
    const test = new Stress();
    let response;
    try {
      const testName = 'firstModeratorAsPresenter';
      await test.logger('begin of ', testName);
      response = await test.moderatorAsPresenter(testName);
      await test.logger('end of ', testName);
    } catch (e) {
      await test.logger(e);
    }
    expect(response).toBe(true);
  });
};

module.exports = exports = stressTest;