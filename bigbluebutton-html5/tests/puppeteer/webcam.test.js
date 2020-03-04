const Page = require('./core/page');
const Share = require('./webcam/share');

describe('Webcam', () => {
  test('Shares webcam', async () => {
    const test = new Share();
    let response;
    try {
      await test.init(Page.getArgsWithVideo());
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
