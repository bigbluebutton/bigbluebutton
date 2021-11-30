const { test } = require('@playwright/test');
const Create = require('./create');
const Join = require('./join');

test.describe.parallel('Breakout', () => {
  test('Create Breakout room', async ({ browser, context, page }) => {
    const test = new Create(browser, context);
    await test.init(page);
    await test.create();
  });

  test('Join Breakout room', async ({ browser, context, page }) => {
    const test = new Join(browser, context);
    await test.init(page);
    await test.create()
    await test.joinRoom();
  });

  test('Join Breakout room and share webcam', async ({ browser, context, page }) => {
    const test = new Join(browser, context);
    await test.init(page);
    await test.create()
    await test.joinAndShareWebcam();
  });

  test('Join Breakout room and share screen', async ({ browser, context, page }) => {
    const test = new Join(browser, context);
    await test.init(page);
    await test.create();
    await test.joinAndShareScreen();
  });

  test('Join Breakout room with Audio', async ({ browser, context, page }) => {
    const test = new Join(browser, context);
    await test.init(page);
    await test.create();
    await test.joinWithAudio();
  });
})