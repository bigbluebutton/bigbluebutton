const Stress = require('./stress.js');

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
    } catch (err) {
      await test.logger(err);
    }
    expect(response).toBe(true);
  });
};

module.exports = exports = stressTest;
