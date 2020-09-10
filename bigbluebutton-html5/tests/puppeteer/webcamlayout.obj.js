const Page = require('./core/page');
const webcamLayout = require('./webcam/webcamlayout');

const webcamLayoutTest = () => {
  beforeEach(() => {
    jest.setTimeout(50000);
  });

  test('Join Webcam and microphone', async () => {
    const test = new webcamLayout();
    let response;
    try {
      await test.init(Page.getArgsWithAudioAndVideo());
      await test.share();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
};
module.exports = exports = webcamLayoutTest;
