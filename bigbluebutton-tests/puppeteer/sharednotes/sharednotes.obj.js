const Page = require('../core/page');
const SharedNotes = require('./sharednotes');
const { closePages } = require('../core/util');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_SHARED_NOTES_TEST_TIMEOUT } = require('../core/constants'); // core constants (Timeouts vars imported)

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
      await test.modPage1.logger('begin of ', testName);
      await test.init(testName);
      await test.modPage1.startRecording(testName);
      await test.userPage1.startRecording(testName);
      response = await test.test();
      await test.modPage1.logger('end of ', testName);
      await test.modPage1.stopRecording();
      await test.userPage1.stopRecording();
      screenshot = await test.modPage1.page.screenshot();
    } catch (err) {
      await test.modPage1.logger(err);
    } finally {
      await closePages(test.modPage1, test.userPage1);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.1, screenshot);
  });
};

module.exports = exports = sharedNotesTest;