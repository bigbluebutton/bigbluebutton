const Page = require('./core/page');
const Draw = require('./whiteboard/draw');

describe('Whiteboard', () => {
  test('Draw rectangle', async () => {
    const test = new Draw();
    let response;
    try {
      await test.init(Page.getArgs());
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
