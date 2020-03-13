const Page = require('./core/page');
const MultiUsers = require('./user/multiusers');
const Notifications = require('./notifications/notifications');

describe('Notifications', () => {
  test('Save settings notification', async () => {
    const test = new Notifications();
    let response;
    try {
      await test.init();
      response = await test.saveSttingsNotification();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Public Chat notification', async () => {
    const test = new Notifications();
    let response;
    try {
      await test.init();
      response = await test.publicChatNotification();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Private Chat notification', async () => {
    const test = new Notifications();
    let response;
    try {
      await test.init();
      response = await test.privateChatNotification();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
