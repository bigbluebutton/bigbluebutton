const Join = require('./breakout/join');
const Create = require('./breakout/create');

describe('Breakoutrooms', () => {
  beforeEach(() => {
    jest.setTimeout(50000);
  });

  test('Create Breakout room', async () => {
    const test = new Create();
    let response;
    try {
      const testName = 'createBreakoutrooms';
      await test.init();
      await test.create(testName);
      response = await test.testCreated(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Join Breakout room', async () => {
    const test = new Join();
    let response;
    try {
      const testName = 'joinBreakoutrooms';
      await test.init();
      await test.create(testName);
      await test.join(testName);
      response = await test.testJoined(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
