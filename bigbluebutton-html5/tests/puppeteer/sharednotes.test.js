const SharedNotes = require('./notes/sharednotes');

describe('Shared notes', () => {
  test('Open Shared notes', async () => {
    const test = new SharedNotes();
    let response;
    try {
      await test.init();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
