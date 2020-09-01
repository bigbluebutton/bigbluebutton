const Page = require('./core/page');
const Slide = require('./presentation/slide');
const Upload = require('./presentation/upload');

const presentationTest = () => {
  beforeEach(() => {
    jest.setTimeout(50000);
  });

  test('Skip slide', async () => {
    const test = new Slide();
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

  test('Upload presentation', async () => {
    const test = new Upload();
    let response;
    try {
      const testName = 'uploadPresentation';
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
};
module.exports = exports = presentationTest;
