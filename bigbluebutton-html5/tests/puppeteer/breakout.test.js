const Join = require('./breakout/join');

describe('Breakoutrooms', () => {
  test('Join Breakout room', async () => {
    const test = new Join();
    let response;
    try {
      await test.init();
      await test.create();
      await test.join();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
