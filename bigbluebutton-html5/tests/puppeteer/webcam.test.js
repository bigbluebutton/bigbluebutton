const Share = require('./webcam/share');
const Check = require('./webcam/check');
const LoadingTime = require('./webcam/loadtime');

describe('Webcam', () => {
  test('Shares webcam', async () => {
    const test = new Share();
    let response;
    try {
      await test.init();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Check Webcam loading time', async () => {
    const test = new LoadingTime();
    let response;
    try {
      await test.init();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBeLessThan(parseInt(process.env.CAMERA_SHARE_FAILED_WAIT_TIME));
  });

  test('Checks content of webcam', async () => {
    const test = new Check();
    let response;
    try {
      await test.init();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
