const Join = require('./breakout/join');
const Create = require('./breakout/create');
const Page = require('./core/page');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const breakoutTest = () => {
  beforeEach(() => {
    jest.setTimeout(150000);
  });

  // // Create Breakout Room
  // test('Create Breakout room', async () => {
  //   const test = new Create();
  //   let response;
  //   let screenshot;
  //   try {
  //     const testName = 'createBreakoutrooms';
  //     await test.init(undefined);
  //     await test.create(testName);
  //     response = await test.testCreatedBreakout(testName);
  //     const page2 = await test.page2.browser.pages();
  //     await page2[2].bringToFront();
  //     screenshot = await page2[2].screenshot();
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.close();
  //   }
  //   expect(response).toBe(true);
  //   if (process.env.REGRESSION_TESTING === 'true') {
  //     expect(screenshot).toMatchImageSnapshot({
  //       failureThreshold: 8,
  //       failureThresholdType: 'percent',
  //     });
  //   }
  // });

  // // Join Breakout Room
  // test('Join Breakout room', async () => {
  //   const test = new Join();
  //   let response;
  //   let screenshot;
  //   try {
  //     const testName = 'joinBreakoutroomsWithoutFeatures';
  //     await test.init(undefined);
  //     await test.create(testName);
  //     await test.join(testName);
  //     response = await test.testJoined(testName);      
  //     const page2 = await test.page2.browser.pages();
  //     await page2[2].bringToFront();
  //     screenshot = await page2[2].screenshot();
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.close();
  //   }
  //   expect(response).toBe(true);
  //   if (process.env.REGRESSION_TESTING === 'true') {
  //     expect(screenshot).toMatchImageSnapshot({
  //       failureThreshold: 4,
  //       failureThresholdType: 'percent',
  //     });
  //   }
  // });

  // // Join Breakout Room with Video
  // test('Join Breakout room with Video', async () => {
  //   const test = new Join();
  //   let response;
  //   let screenshot;
  //   try {
  //     const testName = 'joinBreakoutroomsWithVideo';
  //     await test.init(undefined);
  //     await test.create(testName);
  //     await test.join(testName);
  //     response = await test.testJoined(testName);
  //     const page2 = await test.page2.browser.pages();
  //     await page2[2].bringToFront();
  //     screenshot = await page2[2].screenshot();
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.close();
  //   }
  //   expect(response).toBe(true);
  //   if (process.env.REGRESSION_TESTING === 'true') {
  //     expect(screenshot).toMatchImageSnapshot({
  //       failureThreshold: 0.6,
  //       failureThresholdType: 'percent',
  //     });
  //   }
  // });

  // Join Breakout Room and start Screen Share
  test('Join Breakout room and share screen', async () => {
    const test = new Join();
    let response;
    let screenshot;
    try {
      const testName = 'joinBreakoutroomsAndShareScreen';
      await test.init(undefined);
      await test.create(testName);
      await test.join(testName);
      response = await test.testJoined(testName);
      const page2 = await test.page2.browser.pages();
      await page2[2].bringToFront();
      screenshot = await page2[2].screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.7,
        failureThresholdType: 'percent',
      });
    }
  });

  // Join Breakout Room with Audio
  test('Join Breakout room with Audio', async () => {
    const test = new Join();
    let response;
    let screenshot;
    try {
      const testName = 'joinBreakoutroomsWithAudio';
      await test.init(undefined);
      await test.create(testName);
      await test.join(testName);
      response = await test.testJoined(testName);
      const page2 = await test.page2.browser.pages();
      await page2[2].bringToFront();
      screenshot = await page2[2].screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 3.6,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = breakoutTest;
