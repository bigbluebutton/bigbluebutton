import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { readRows } from '../core/graphql';
import { Page } from '../core/page';
import { Join } from './join';

// The meeting's lock settings as the client reads them (bbb-graphql-server v_meeting_lockSettings)
interface LockSettings {
  disableCam: boolean;
  disablePrivateChat: boolean;
  disablePublicChat: boolean;
  disableNotes: boolean;
  hideUserList: boolean;
  hideViewersCursor: boolean;
  hideViewersAnnotation: boolean;
  lockOnJoin: boolean;
  lockOnJoinConfigurable: boolean;
  webcamsOnlyForModerator: boolean;
}
type LockSetting = keyof LockSettings;

const MEETING_LOCK_SETTINGS = `subscription { meeting { lockSettings {
  disableCam disablePrivateChat disablePublicChat disableNotes hideUserList hideViewersCursor
  hideViewersAnnotation lockOnJoin lockOnJoinConfigurable webcamsOnlyForModerator
} } }`;
const OWN_USER_ID = 'subscription { user_current { userId } }';
const CAMERAS = 'subscription { user_camera { streamId userId } }';

// The Lock viewers switches no other breakout test denies, with the lock setting each one sets
const OTHER_LOCK_SWITCHES: { selector: string; setting: LockSetting; label: string }[] = [
  { selector: e.lockPublicChat, setting: 'disablePublicChat', label: 'Send public chat messages' },
  { selector: e.lockEditSharedNotes, setting: 'disableNotes', label: 'Edit shared notes' },
  { selector: e.lockUserList, setting: 'hideUserList', label: 'See other viewers in the user list' },
  { selector: e.hideViewersCursor, setting: 'hideViewersCursor', label: "See other viewers' cursor" },
  { selector: e.hideViewersAnnotation, setting: 'hideViewersAnnotation', label: "See other viewers' annotations" },
];
// Two more lock settings a room takes from its parent; the Lock viewers modal has no switch for them.
// The parent gets them from its create parameters.
const LOCKS_WITHOUT_SWITCH: LockSetting[] = ['lockOnJoin', 'lockOnJoinConfigurable'];
export const LOCKS_WITHOUT_SWITCH_CREATE_PARAMETER =
  'lockSettingsLockOnJoin=true&lockSettingsLockOnJoinConfigurable=true';

async function readLockSettings(testPage: Page): Promise<LockSettings | undefined> {
  const [meeting] = await readRows<{ lockSettings: LockSettings }>(testPage, MEETING_LOCK_SETTINGS, 'meeting');
  return meeting?.lockSettings;
}

async function waitForLockSettings(testPage: Page, expected: Partial<LockSettings>, message: string) {
  await expect
    .poll(() => readLockSettings(testPage), { message, timeout: ELEMENT_WAIT_LONGER_TIME })
    .toMatchObject(expected);
}

async function ownUserId(testPage: Page): Promise<string> {
  const [user] = await readRows<{ userId: string }>(testPage, OWN_USER_ID, 'user_current');
  return user.userId;
}

async function camerasOf(testPage: Page, userId: string) {
  const cameras = await readRows<{ streamId: string; userId: string }>(testPage, CAMERAS, 'user_camera');
  return cameras.filter((camera) => camera.userId === userId);
}

// Lock settings in breakout rooms: what a room takes from its parent when the moderator ticks
// "inherit lock settings", and whether the locks bind the attendees in the room
export class BreakoutLocks extends Join {
  // Denies the given Lock viewers switches (a checked switch means the viewers are allowed) and applies them
  private static async denyPermissions(testPage: Page, selectors: string[]) {
    await BreakoutLocks.openLockViewersPermissions(testPage.page);
    for (const selector of selectors) {
      await BreakoutLocks.setCheckboxChecked(testPage.page, selector, false);
    }
    await testPage.waitAndClick(e.applyLockSettings);
    await testPage.wasRemoved(e.applyLockSettings, 'should close the lock viewers modal once applied');
  }

  // Assigns the attendees to the first room and creates the rooms with "inherit lock settings" set as asked
  private async createRoomsFor(attendees: Page[], inheritLockSettings: boolean) {
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitForSelector(e.attendeeNotAssigned, ELEMENT_WAIT_EXTRA_LONG_TIME);
    // the unassigned users are listed by name, so the attendees come before the moderator
    for (const attendee of attendees) {
      await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
      await this.modPage.hasText(e.breakoutBox1, attendee.username, `should assign ${attendee.username} to room 1`);
    }
    await this.modPage.waitAndClick(e.moreOptionsToggle);
    await BreakoutLocks.setCheckboxChecked(this.modPage.page, e.inheritLockSettingsCheckbox, inheritLockSettings);
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.roomOptions1, 'should display the first room in the breakout panel');
  }

  private async joinFirstRoomAsModerator(): Promise<Page> {
    const roomTab = await this.joinFirstBreakoutRoomAsModerator();
    return new Page(this.browser, roomTab, this.modPage.testInfo);
  }

  // The parent denies the five switches above and has lockOnJoin and lockOnJoinConfigurable on. With
  // inheritance the room takes all seven; without it the room gets every lock setting false
  // (CreateBreakoutRoomsCmdMsgHdlr.scala:98-104).
  async otherLockSettingsFollowInheritance(inherit: boolean) {
    await BreakoutLocks.denyPermissions(
      this.modPage,
      OTHER_LOCK_SWITCHES.map(({ selector }) => selector),
    );
    const parentLocks = Object.fromEntries(
      [...OTHER_LOCK_SWITCHES.map(({ setting }) => setting), ...LOCKS_WITHOUT_SWITCH].map((setting) => [setting, true]),
    );
    await waitForLockSettings(this.modPage, parentLocks, 'the main room should apply the locks before the rooms exist');

    await this.createRoomsFor([this.userPage], inherit);
    await this.userPage.waitAndClick(e.modalDismissButton);
    const roomModPage = await this.joinFirstRoomAsModerator();

    const roomLocks = await readLockSettings(roomModPage);
    for (const setting of Object.keys(parentLocks) as LockSetting[]) {
      expect(roomLocks?.[setting], `the room should ${inherit ? '' : 'not '}take ${setting} from the main room`).toBe(
        inherit,
      );
    }

    await BreakoutLocks.openLockViewersPermissions(roomModPage.page);
    for (const { selector, label } of OTHER_LOCK_SWITCHES) {
      await expect(
        roomModPage.page.locator(selector),
        `should ${inherit ? 'deny' : 'allow'} "${label}" in the room's lock viewers modal`,
      ).toBeChecked({ checked: !inherit, timeout: ELEMENT_WAIT_LONGER_TIME });
    }
  }

  // The parent denies public chat and shared notes; the attendee in the room is bound by them only when
  // the room inherited them
  async chatAndNotesLocksInRoom(inherit: boolean) {
    await BreakoutLocks.denyPermissions(this.modPage, [e.lockPublicChat, e.lockEditSharedNotes]);
    await waitForLockSettings(
      this.modPage,
      { disablePublicChat: true, disableNotes: true },
      'the main room should apply the locks before the rooms exist',
    );
    await this.createRoomsFor([this.userPage], inherit);
    const roomUserPage = await this.joinRoomFromInvitation(this.userPage);

    if (inherit) {
      await roomUserPage.hasElementDisabled(
        e.chatBox,
        'should disable the public chat input for the attendee in the room',
        ELEMENT_WAIT_LONGER_TIME,
      );
      await roomUserPage.hasElementDisabled(e.sendButton, 'should disable the public chat send button in the room');
      await roomUserPage.waitAndClick(e.sharedNotesSidebarButton);
      await roomUserPage.hasElement(
        e.blockNoteReadOnly,
        'should display the shared notes read-only for the attendee in the room',
        ELEMENT_WAIT_LONGER_TIME,
      );
      return;
    }

    await roomUserPage.hasElementEnabled(
      e.chatBox,
      'should let the attendee type in the public chat of the room',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await roomUserPage.fill(e.chatBox, e.message);
    await roomUserPage.waitAndClick(e.sendButton);
    await roomUserPage.hasText(
      e.chatUserMessageText,
      e.message,
      'should post the message the attendee sent in the public chat of the room',
    );
    await roomUserPage.waitAndClick(e.sharedNotesSidebarButton);
    await roomUserPage.hasElement(
      e.blockNoteEditable,
      'should let the attendee edit the shared notes of the room',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // The attendee is in room 1 before the moderator locks public chat and webcams there. The parent locks
  // nothing, so inheritance carries only its lockOnJoin=true into the room.
  async locksAppliedInRoomBindAttendee(inherit: boolean) {
    await this.createRoomsFor([this.userPage], inherit);
    const roomUserPage = await this.joinRoomFromInvitation(this.userPage);
    await roomUserPage.hasElementEnabled(
      e.chatBox,
      'should let the attendee use the public chat of the room before any lock',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await roomUserPage.hasElementEnabled(e.joinVideo, 'should let the attendee share a webcam before any lock');

    const roomModPage = await this.joinFirstRoomAsModerator();
    await BreakoutLocks.denyPermissions(roomModPage, [e.lockPublicChat, e.lockShareWebcam]);
    await waitForLockSettings(
      roomUserPage,
      { disablePublicChat: true, disableCam: true },
      'the room should apply the locks the moderator set in it',
    );

    await roomUserPage.hasElementDisabled(
      e.chatBox,
      'should disable the public chat input for the attendee once the moderator locks it in the room',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await roomUserPage.hasElementDisabled(
      e.joinVideo,
      'should disable the webcam button for the attendee once the moderator locks webcams in the room',
    );
  }

  // The parent denies "See other viewers' webcams"; in room 1 one attendee shares a webcam and the other
  // gets it only when the room did not inherit the lock
  async otherViewersWebcamsInRoom(inherit: boolean) {
    await BreakoutLocks.denyPermissions(this.modPage, [e.lockSeeOtherViewersWebcam]);
    await waitForLockSettings(
      this.modPage,
      { webcamsOnlyForModerator: true },
      'the main room should apply the lock before the rooms exist',
    );
    await this.createRoomsFor([this.userPage, this.userPage2], inherit);
    const sharingPage = await this.joinRoomFromInvitation(this.userPage);
    const watchingPage = await this.joinRoomFromInvitation(this.userPage2);

    const { videoPreviewTimeout } = this.userPage.settings || {};
    await sharingPage.shareWebcam({ videoPreviewTimeout });
    const sharerId = await ownUserId(sharingPage);
    await expect
      .poll(async () => (await camerasOf(sharingPage, sharerId)).length, {
        message: 'the room should register the webcam of the attendee who shares it',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBe(1);

    if (inherit) {
      expect(
        await camerasOf(watchingPage, sharerId),
        "the room should not give the other attendee the viewer's webcam",
      ).toHaveLength(0);
      await watchingPage.hasElementCount(
        e.webcamVideoItem,
        0,
        "should not show the other attendee the viewer's webcam in the room",
      );
      return;
    }

    await watchingPage.hasElement(
      e.remoteStreamVideo,
      "should show the other attendee the viewer's webcam in the room",
      VIDEO_LOADING_WAIT_TIME,
    );
    await watchingPage.hasElementCount(
      e.webcamVideoItem,
      1,
      "should show the other attendee one webcam, the viewer's, in the room",
    );
  }
}
