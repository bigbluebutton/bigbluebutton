const Page = require('./core/page');
const Draw = require('./whiteboard/draw');

const whiteboardTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Draw rectangle', async () => {
    const test = new Draw();
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
};
module.exports = exports = whiteboardTest;
