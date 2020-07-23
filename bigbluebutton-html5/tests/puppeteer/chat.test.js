const Page = require('./core/page');
const Send = require('./chat/send');
const Clear = require('./chat/clear');
const Copy = require('./chat/copy');
const Save = require('./chat/save');
const MultiUsers = require('./user/multiusers');

describe('Chat', () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Send message', async () => {
    const test = new Send();
    let response;
    try {
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Clear chat', async () => {
    const test = new Clear();
    let response;
    try {
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Copy chat', async () => {
    const test = new Copy();
    let response;
    try {
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Save chat', async () => {
    const test = new Save();
    let response;
    try {
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Send private chat to other User', async () => {
    const test = new MultiUsers();
    let response;
    try {
      await test.init();
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.multiUsersPrivateChat();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });

  test('Send public chat', async () => {
    const test = new MultiUsers();
    let response;
    try {
      await test.init();
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.multiUsersPublicChat();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });
});
