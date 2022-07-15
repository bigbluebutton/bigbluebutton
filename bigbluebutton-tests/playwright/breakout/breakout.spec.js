const { test } = require('@playwright/test');
const { Create } = require('./create');
const { Join } = require('./join');

test.describe.parallel('Breakout', () => {
  test('Create Breakout room @ci', async ({ browser, context, page }) => {
    const create = new Create(browser, context);
    await create.initPages(page);
    await create.create();
  });

  // https://docs.bigbluebutton.org/2.5/release-tests.html#moderators-creating-breakout-rooms-and-assiging-users-automated
  test('Join Breakout room @ci', async ({ browser, context, page }) => {
    const join = new Join(browser, context);
    await join.initPages(page);
    await join.create()
    await join.joinRoom();
  });

  test('Join Breakout room and share webcam', async ({ browser, context, page }) => {
    const join = new Join(browser, context);
    await join.initPages(page);
    await join.create()
    await join.joinAndShareWebcam();
  });

  test('Join Breakout room and share screen', async ({ browser, context, page }) => {
    const join = new Join(browser, context);
    await join.initPages(page);
    await join.create();
    await join.joinAndShareScreen();
  });

  test('Join Breakout room with Audio', async ({ browser, context, page }) => {
    const join = new Join(browser, context);
    await join.initPages(page);
    await join.create();
    await join.joinWithAudio();
  });
});
