const Page = require('./core/page');
const Slide = require('./presentation/slide');
const Upload = require('./presentation/upload');

describe('Presentation', () => {
  test('Skip slide', async () => {
    const test = new Slide();
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

  test('Upload presentation', async () => {
    const test = new Upload();
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
