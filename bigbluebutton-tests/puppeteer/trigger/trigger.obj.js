const Page = require('../core/page');
const Trigger = require('./trigger');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_TRIGGER_EVENTS_TEST_TIMEOUT } = require('../core/constants'); // core constants (Timeouts vars imported)

expect.extend({ toMatchImageSnapshot });

const triggerTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_TRIGGER_EVENTS_TEST_TIMEOUT);
  });

  test('Trigger disconnection: Meteor.disconnect()/.status()', async () => {
    const test = new Trigger();
    let response;
    let screenshot;
    try {
      const testName = 'triggerMeteorDisconnect';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName);
      response = await test.triggerMeteorDisconnect(testName);
      screenshot = await test.page.screenshot();
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.1, screenshot);
  });

  test('Trigger disconnection: SHUTTING DOWN NETWORK SERVICE', async () => {
    const test = new Trigger();
    let response;
    let screenshot;
    try {
      const testName = 'triggerNetworkServiceDisconnection';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName);
      response = await test.triggerNetworkServiceDisconnection(testName);
      screenshot = await test.page.screenshot();
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.1, screenshot);
  });

  test('Meteor Reconnection', async () => {
    const test = new Trigger();
    let response;
    let screenshot;
    try {
      const testName = 'MeteorReconnection';
      await test.logger('begin of ', testName);
      response = await test.meteorReconnection(testName);
      screenshot = await test.page.screenshot();
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.1, screenshot);
  });
};

module.exports = exports = triggerTest;