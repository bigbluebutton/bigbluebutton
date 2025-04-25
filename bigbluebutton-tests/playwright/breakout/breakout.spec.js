const { linkIssue } = require('../core/helpers');
const { test } = require('../fixtures');
const { Create } = require('./create');
const { Join } = require('./join');

test.describe.parallel('Breakout', { tag: '@ci' }, () => {
  test.describe.parallel('Creating', () => {
    test('Create Breakout room', async ({ browser, context, page }) => {
      const create = new Create(browser, context);
      await create.initPages(page);
      await create.create();
    });

    test('Change number of rooms', async ({ browser, context, page }) => {
      const create = new Create(browser, context);
      await create.initPages(page);
      await create.changeNumberOfRooms();
    });

    test('Change duration time', async ({ browser, context, page }) => {
      const create = new Create(browser, context);
      await create.initPages(page);
      await create.changeDurationTime();
    });

    test('Change rooms name', async ({ browser, context, page }) => {
      const create = new Create(browser, context);
      await create.initPages(page);
      await create.changeRoomsName();
    });

    test('Remove and reset assignments', async ({ browser, context, page }) => {
      const create = new Create(browser, context);
      await create.initPages(page);
      await create.removeAndResetAssignments();
    });

    test('Drag and drop user in a room', async ({ browser, context, page }) => {
      const create = new Create(browser, context);
      await create.initPages(page);
      await create.dragDropUserInRoom();
    });
  });

  test.describe.parallel('After creating', () => {
    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#moderators-creating-breakout-rooms-and-assiging-users-automated
    test('Join Breakout room', async ({ browser, context, page }) => {
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

    test('Join Breakout room and share screen', async ({ browser, context, page, browserName }) => {
      test.skip(browserName === 'firefox', 'Firefox is too heavy for this test, needs improvement.')
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

    test('Message to all rooms', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.create();
      await join.messageToAllRooms();
    });

    test('Change duration time', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.create();
      await join.changeDurationTime();
    });

    test('User name shows below rooms name', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.create();
      await join.usernameShowsBelowRoomsName();
    });

    test('Show breakout room time remaining', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.create();
      await join.showBreakoutRoomTimeRemaining();
    });

    test('End all breakout rooms', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.create();
      await join.endAllBreakoutRooms();
    });

    test('Invite user after creating rooms', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.create();
      await join.inviteUserAfterCreatingRooms();
    });

    test('Move user to another room', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.create();
      await join.moveUserToOtherRoom();
    });

    test('Export breakout room shared notes', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.create(true);
      await join.exportBreakoutNotes();
    });

    test('Export breakout room whiteboard annotations', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.create(false, true);
      await join.exportBreakoutWhiteboard();
    });

    test('User can choose a room', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.createToAllowChooseOwnRoom();
      await join.userCanChooseRoom();
    });
    
    test('Breakout rooms can use different presentations', async ({ browser, context, page }) => {
      const join = new Join(browser, context);
      await join.initPages(page);
      await join.breakoutWithDifferentPresentations();
    });
  });
});
