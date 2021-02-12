const SharedNotes = require('./notes/sharednotes');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const sharedNotesTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Open Shared notes', async () => {
    const test = new SharedNotes();
    let response;
    let screenshot;
    try {
      await test.init();
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.test();
      screenshot = await test.page1.page.screenshot();
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
module.exports = exports = sharedNotesTest;
