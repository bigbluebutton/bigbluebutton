import { linkIssue } from '../core/helpers';
import { ClientSettingsOverrides } from '../core/page';
import { test } from '../core/setup/fixtures';
import { PanelDefaults } from './panelDefaults';

// public.app.breakouts.* of settings.yml, injected in the browser
const breakouts = (settings: ClientSettingsOverrides): ClientSettingsOverrides => ({
  public: { app: { breakouts: settings } },
});

const RECORDABLE_BREAKOUTS = 'record=true&breakoutRoomsRecord=true';

test.describe.parallel('Breakout creation panel defaults', { tag: '@ci' }, () => {
  test.describe.parallel('Allow users to choose a room', () => {
    test('is unticked by default', async ({ browser, context, page }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, { testInfo });
      await panel.allowChooseRoomPreTicked(false);
    });

    test('is pre-ticked when allowUserChooseRoomByDefault is true', async ({ browser, context, page }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, {
        testInfo,
        clientSettingsOverrides: breakouts({ allowUserChooseRoomByDefault: true }),
      });
      await panel.allowChooseRoomPreTicked(true);
    });
  });

  test.describe.parallel('Capture whiteboard and shared notes', () => {
    test('are unticked by default', async ({ browser, context, page }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, { testInfo });
      await panel.captureSwitchesPreTicked({ whiteboard: false, sharedNotes: false });
    });

    test('captureWhiteboardByDefault=true pre-ticks only Capture whiteboard', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, {
        testInfo,
        clientSettingsOverrides: breakouts({ captureWhiteboardByDefault: true }),
      });
      await panel.captureSwitchesPreTicked({ whiteboard: true, sharedNotes: false });
    });

    test('captureSharedNotesByDefault=true pre-ticks only Capture shared notes', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, {
        testInfo,
        clientSettingsOverrides: breakouts({ captureSharedNotesByDefault: true }),
      });
      await panel.captureSwitchesPreTicked({ whiteboard: false, sharedNotes: true });
    });

    // The panel seeds both switches from settings.yml only: sidebar-create-breakout/component.tsx:329-332 reads
    // captureWhiteboardByDefault / captureSharedNotesByDefault from window.meetingClientSettings, and :340-341 use
    // them as the initial state. The meeting's breakoutPolicies.captureSlides / captureNotes is never read.
    test(
      'breakoutRoomsCaptureSlides and breakoutRoomsCaptureNotes pre-tick the capture options',
      { tag: '@known-issue' },
      async ({ browser, context, page }, testInfo) => {
        linkIssue(26228);
        const panel = new PanelDefaults(browser, context);
        await panel.initModPage(page, {
          testInfo,
          createParameter: 'breakoutRoomsCaptureSlides=true&breakoutRoomsCaptureNotes=true',
        });
        await panel.captureSwitchesFollowTheCreateParameters();
      },
    );
  });

  test.describe.parallel('Record', () => {
    test('is not offered by default even when the parent allows recording the rooms', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, { testInfo, createParameter: RECORDABLE_BREAKOUTS });
      await panel.recordOption('absent', true);
    });

    test('is offered unticked when offerRecordingForBreakouts is true', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, {
        testInfo,
        createParameter: RECORDABLE_BREAKOUTS,
        clientSettingsOverrides: breakouts({ offerRecordingForBreakouts: true }),
      });
      await panel.recordOption('unticked', true);
    });

    test('is offered pre-ticked when recordRoomByDefault is also true', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, {
        testInfo,
        createParameter: RECORDABLE_BREAKOUTS,
        clientSettingsOverrides: breakouts({ offerRecordingForBreakouts: true, recordRoomByDefault: true }),
      });
      await panel.recordOption('ticked', true);
    });

    test('is not offered when the parent leaves breakoutRoomsRecord at false', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, {
        testInfo,
        createParameter: 'record=true',
        clientSettingsOverrides: breakouts({ offerRecordingForBreakouts: true }),
      });
      await panel.recordOption('absent', false);
    });
  });

  test.describe.parallel('Send invitation to assigned moderators', () => {
    test('is unticked by default', async ({ browser, context, page }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, { testInfo });
      await panel.inviteModeratorsPreTicked(false);
    });

    test('is pre-ticked when sendInvitationToAssignedModeratorsByDefault is true', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, {
        testInfo,
        clientSettingsOverrides: breakouts({ sendInvitationToAssignedModeratorsByDefault: true }),
      });
      await panel.inviteModeratorsPreTicked(true);
    });

    test('ticked, invites an assigned moderator to join the room', async ({ browser, context, page }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, { testInfo });
      await panel.initModPage2(context, { testInfo });
      await panel.initUserPage(context, { testInfo });
      await panel.assignedModeratorInvitation(true);
    });

    test('unticked, invites the assigned attendee but not the assigned moderator', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, { testInfo });
      await panel.initModPage2(context, { testInfo });
      await panel.initUserPage(context, { testInfo });
      await panel.assignedModeratorInvitation(false);
    });
  });

  test.describe.parallel('Number of rooms', () => {
    test('stays between 2 and 16 by default', async ({ browser, context, page }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, { testInfo });
      await panel.numberOfRoomsStaysWithin(2, 16);
    });

    test('cannot go above breakoutRoomLimit', async ({ browser, context, page }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, { testInfo, clientSettingsOverrides: breakouts({ breakoutRoomLimit: 3 }) });
      await panel.numberOfRoomsStaysWithin(2, 3);
    });

    test('starts at breakoutRoomMinimum and cannot go below it', async ({ browser, context, page }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, { testInfo, clientSettingsOverrides: breakouts({ breakoutRoomMinimum: 3 }) });
      await panel.numberOfRoomsStaysWithin(3, 16);
    });
  });

  test.describe.parallel('Presentation management in the rooms', () => {
    // settings.yml ships allowPresentationManagementInBreakouts: true
    test('is offered to the room presenter by default', async ({ browser, context, page }, testInfo) => {
      const panel = new PanelDefaults(browser, context);
      await panel.initPages(page, testInfo);
      await panel.presentationManagementInRoom(true);
    });

    test('is not offered to the room presenter when allowPresentationManagementInBreakouts is false', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      const overrides = breakouts({ allowPresentationManagementInBreakouts: false });
      const panel = new PanelDefaults(browser, context);
      await panel.initModPage(page, { testInfo, clientSettingsOverrides: overrides });
      await panel.initUserPage(context, { testInfo });
      await panel.presentationManagementInRoom(false, overrides);
    });
  });
});
