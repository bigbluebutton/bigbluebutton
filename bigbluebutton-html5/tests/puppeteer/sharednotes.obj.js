const SharedNotes = require('./notes/sharednotes');

const sharedNotesTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Open Shared notes', async () => {
    const test = new SharedNotes();
    let response;
    try {
      await test.init();
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
};
module.exports = exports = sharedNotesTest;
