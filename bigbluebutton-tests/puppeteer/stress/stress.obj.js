const Stress = require('./stress.js');

const stressTest = () => {
  // First moderator to join the meeting should be the presenter
  test('First moderator joining as presenter', async () => {
    const test = new Stress();
    let response;
    try {
      const testName = 'firstModeratorAsPresenter';
      await test.modPage.logger('begin of ', testName);
      response = await test.moderatorAsPresenter(testName);
      await test.modPage.logger('end of ', testName);
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await test.modPage.close();
    }
    expect(response).toBe(true);
  });

  // Check that all users invited to a breakout room can join it
  test('All users must receive breakout room invitations', async () => {
    const test = new Stress();
    let response;
    try {
      const testName = 'breakoutRoomInvitation';
      await test.modPage.logger('begin of ', testName);
      response = await test.breakoutRoomInvitation(testName);
      await test.modPage.logger('end of ', testName);
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await test.modPage.close();
      await test.closeUsersPages();
    }
    expect(response).toBe(true);
  });
};

module.exports = exports = stressTest;
