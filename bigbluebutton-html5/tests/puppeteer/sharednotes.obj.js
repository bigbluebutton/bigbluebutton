const SharedNotes = require('./notes/sharednotes');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_SHARED_NOTES_TEST_TIMEOUT } = require('./core/constants'); // core constants (Timeouts vars imported)

expect.extend({ toMatchImageSnapshot });

const sharedNotesTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_SHARED_NOTES_TEST_TIMEOUT);
  });

  test('Open Shared notes', async () => {
    const test = new SharedNotes();
    let response;
    let screenshot;
    try {
      const testName = 'openSharedNotes';
      await test.page1.logger('begin of ', testName);
      await test.init(undefined, testName);
      await test.page1.startRecording(testName);
      await test.page1.closeAudioModal();
      await test.page2.startRecording(testName);
      await test.page2.closeAudioModal();
      response = await test.test();
      await test.page1.logger('end of ', testName);
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (e) {
      await test.page1.logger(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.1,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = sharedNotesTest;
