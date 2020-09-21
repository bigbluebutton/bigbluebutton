const Join = require('./breakout/join');
const Create = require('./breakout/create');
const Page = require('./core/page');

const breakoutTest = () => {
  beforeEach(() => {
    jest.setTimeout(150000);
  });

  // // Create Breakout Room
  // test('Create Breakout room', async () => {
  //   const test = new Create();
  //   let response;
  //   try {
  //     const testName = 'createBreakoutrooms';
  //     await test.init(undefined);
  //     await test.create(testName);
  //     response = await test.testCreatedBreakout(testName);
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.close();
  //   }
  //   expect(response).toBe(true);
  // });

  // // Join Breakout Room
  // test('Join Breakout room', async () => {
  //   const test = new Join();
  //   let response;
  //   try {
  //     const testName = 'joinBreakoutroomsWithoutFeatures';
  //     await test.init(undefined);
  //     await test.create(testName);
  //     await test.join(testName);
  //     response = await test.testJoined(testName);
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.close();
  //   }
  //   expect(response).toBe(true);
  // });

  // // Join Breakout Room with Video
  // test('Join Breakout room with Video', async () => {
  //   const test = new Join();
  //   let response;
  //   try {
  //     const testName = 'joinBreakoutroomsWithVideo';
  //     await test.init(undefined);
  //     await test.create(testName);
  //     await test.join(testName);
  //     response = await test.testJoined(testName);
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.close();
  //   }
  //   expect(response).toBe(true);
  // });

  // // Join Breakout Room and start Screen Share
  // test('Join Breakout room and share screen', async () => {
  //   const test = new Join();
  //   let response;
  //   try {
  //     const testName = 'joinBreakoutroomsAndShareScreen';
  //     await test.init(undefined);
  //     await test.create(testName);
  //     await test.join(testName);
  //     response = await test.testJoined(testName);
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.close();
  //   }
  //   expect(response).toBe(true);
  // });

  // Join Breakout Room with Audio
  test('Join Breakout room with Audio', async () => {
    const test = new Join();
    let response;
    try {
      const testName = 'joinBreakoutroomsWithAudio';
      await test.init(undefined);
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
};
module.exports = exports = breakoutTest;
