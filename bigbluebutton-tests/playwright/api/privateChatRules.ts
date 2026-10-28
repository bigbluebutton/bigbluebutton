import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { getOwnUserId, graphql, readRows, sendMutation, waitForServerToCatchUp } from '../core/graphql';
import { getRandomInt } from '../core/helpers';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { BREAKOUT_ROOM_CREATE } from './breakout';
import { CREATE_PRIVATE_CHAT, getPrivateMessages, PRIVATE_CHATS, sendPrivateMessage } from './disabledFeatures';

const pollOptions = { timeout: ELEMENT_WAIT_LONGER_TIME };

// CreateGroupChatReqMsgHdlr.scala:57 lets a locked viewer create a private chat during the 5 s that
// follow a change of the meeting's lock settings, and a meeting's lock settings are set when it starts
const LOCK_CHANGE_GRACE_TIME = 5000;

// The mutations the client sends (bigbluebutton-html5 mutations.ts files) and the views a participant
// reads the result from. The chat helpers below are copied from api/disabledFeatures.ts.
// the user list's lock toggle (bigbluebutton-html5/imports/ui/core/graphql/mutations/userMutations.ts SET_LOCKED)
const SET_USER_LOCKED =
  'mutation SetUserLocked($userId: String!, $locked: Boolean!) { userSetLocked(userId: $userId, locked: $locked) }';
// the create breakout rooms panel (bigbluebutton-html5/imports/ui/components/breakout-room/mutations.ts)
const CURRENT_USER = 'subscription { user_current { userId raiseHand locked } }';
const PRIVATE_CHAT_LOCK = 'subscription { meeting { lockSettings { disablePrivateChat lockOnJoin } } }';

interface CurrentUser {
  userId: string;
  raiseHand: boolean;
  locked: boolean;
}

const readCurrentUser = async (page: Page) =>
  (await readRows<CurrentUser>(page, CURRENT_USER, 'user_current'))[0] as CurrentUser | undefined;

async function privateChatWith(page: Page, participantId: string) {
  // read without asserting: a sender ejected for an attempt cannot read anymore
  const { data } = await graphql(page, PRIVATE_CHATS);
  const chats = (data?.chat ?? []) as { chatId: string; participantId: string }[];
  return chats.find((row) => row.participantId === participantId);
}

const uniqueMessage = (label: string) => `${label}-${getRandomInt(1000000, 10000000)}`;

// Waits out the lock-change grace period counted from `since`, a moment after the lock settings were set
async function waitForLockGraceToPass(since: number) {
  await expect
    .poll(() => Date.now() - since, {
      message: 'the lock settings should be older than the grace period of CreateGroupChatReqMsgHdlr',
      timeout: LOCK_CHANGE_GRACE_TIME * 2,
    })
    .toBeGreaterThan(LOCK_CHANGE_GRACE_TIME);
}

// The server's private chat rules, driven through GraphQL as the client would send them
// (CreateGroupChatReqMsgHdlr.scala, SendGroupChatMessageMsgHdlr.scala)
export class PrivateChatRules extends MultiUsers {
  // Checks that `sender` cannot start a private chat with `receiver`: the receiver gets neither
  // the chat nor the message
  private static async expectPrivateChatRefused(sender: Page, receiver: Page, description: string) {
    const message = uniqueMessage('refused-private-chat');
    const senderId = await getOwnUserId(sender);
    await sendPrivateMessage(sender, receiver, message);
    expect(await getPrivateMessages(receiver), `${description}: the receiver should not get the message`).not.toContain(
      message,
    );
    expect(
      await privateChatWith(receiver, senderId),
      `${description}: the receiver should not get a private chat with the sender`,
    ).toBeUndefined();
  }

  private static async expectPrivateChatDelivered(sender: Page, receiver: Page, description: string) {
    const message = uniqueMessage('delivered-private-chat');
    await sendPrivateMessage(sender, receiver, message);
    expect(await getPrivateMessages(receiver), `${description}: the receiver should get the message`).toContain(
      message,
    );
  }

  // disabledFeatures=privateChat refuses only the chats without a moderator (CreateGroupChatReqMsgHdlr.scala:38-47,59)
  async disabledPrivateChatKeepsModeratorChats() {
    await PrivateChatRules.expectPrivateChatDelivered(
      this.userPage,
      this.modPage,
      'an attendee should still chat privately with the moderator',
    );
    await PrivateChatRules.expectPrivateChatDelivered(
      this.modPage,
      this.userPage2,
      'the moderator should still chat privately with an attendee',
    );
    await PrivateChatRules.expectPrivateChatRefused(
      this.userPage,
      this.userPage2,
      'an attendee should not chat privately with another attendee',
    );
  }

  // A third attendee of the meeting, for a request the server may answer with an eject
  private async joinDisposableAttendee(): Promise<Page> {
    if (!this.modPage.context) throw new Error('modPage not initialized');
    const attendee = new Page(this.browser, await this.modPage.context.newPage(), this.modPage.testInfo);
    await attendee.init(false, { fullName: 'Attendee3', meetingId: this.modPage.meetingId });
    return attendee;
  }

  // lockSettingsDisablePrivateChat=true: a locked attendee chats privately with the moderator only, and
  // with the other attendee once the moderator unlocks them
  async privateChatLockUntilUnlocked(lockedSince: number) {
    expect((await readCurrentUser(this.userPage))?.locked, 'the attendee should join locked').toBe(true);
    await waitForLockGraceToPass(lockedSince);

    await PrivateChatRules.expectPrivateChatDelivered(
      this.userPage,
      this.modPage,
      'a locked attendee should chat privately with the moderator',
    );
    // a refused request ejects its sender when apps.ejectOnViolation is on (off by default), so the
    // attendee the moderator unlocks below never sends one
    const disposableAttendee = await this.joinDisposableAttendee();
    expect((await readCurrentUser(disposableAttendee))?.locked, 'the third attendee should join locked').toBe(true);
    await PrivateChatRules.expectPrivateChatRefused(
      disposableAttendee,
      this.userPage2,
      'a locked attendee should not chat privately with another attendee',
    );

    const attendeeId = await getOwnUserId(this.userPage);
    const otherAttendeeId = await getOwnUserId(this.userPage2);
    await sendMutation(this.modPage, SET_USER_LOCKED, 'userSetLocked', { userId: attendeeId, locked: false });
    await expect
      .poll(async () => (await readCurrentUser(this.userPage))?.locked, {
        ...pollOptions,
        message: 'the moderator should unlock the attendee',
      })
      .toBe(false);
    // retry the create until the server takes it: the unlock reaches akka-apps asynchronously
    await expect
      .poll(
        async () => {
          await sendMutation(this.userPage, CREATE_PRIVATE_CHAT, 'chatCreateWithUser', { userId: otherAttendeeId });
          await waitForServerToCatchUp(this.userPage2);
          return (await privateChatWith(this.userPage, otherAttendeeId)) !== undefined;
        },
        {
          message: 'the server should accept the private chat of the unlocked attendee',
          timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
        },
      )
      .toBe(true);
    await PrivateChatRules.expectPrivateChatDelivered(
      this.userPage,
      this.userPage2,
      'the unlocked attendee should chat privately with the other attendee',
    );
  }

  private async joinFromInvitation(attendee: Page): Promise<Page> {
    const roomTab = await attendee.handleNewTab(e.modalConfirmButton, attendee.page.context());
    const roomPage = new Page(this.browser, roomTab, this.modPage.testInfo);
    await roomPage.hasElement(e.presentationTitle, 'should load the breakout room', ELEMENT_WAIT_EXTRA_LONG_TIME);
    await roomPage.closeAudioModal();
    return roomPage;
  }

  // The parent has lockSettingsDisablePrivateChat=true; the moderator creates the rooms through the
  // panel's mutation with both attendees in room 1, and the attendees try a private chat in the room
  async privateChatLockInRoom(inheritLockSettings: boolean) {
    const attendeeIds = [await getOwnUserId(this.userPage), await getOwnUserId(this.userPage2)];
    const room = (sequence: number, users: string[]) => ({
      name: `Room ${sequence}`,
      shortName: `Room ${sequence}`,
      sequence,
      isDefaultName: true,
      freeJoin: false,
      captureNotesFilename: `Room_${sequence}_Notes`,
      captureSlidesFilename: `Room_${sequence}_Whiteboard`,
      users,
      allPages: false,
      presId: '',
    });
    await sendMutation(this.modPage, BREAKOUT_ROOM_CREATE, 'breakoutRoomCreate', {
      record: false,
      captureNotes: false,
      captureSlides: false,
      durationInSeconds: 15 * 60,
      sendInviteToModerators: false,
      inheritLockSettings,
      rooms: [room(1, attendeeIds), room(2, [])],
    });

    await this.userPage.hasElement(
      e.modalConfirmButton,
      'should invite the attendee to room 1',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    // the room exists, so its lock settings were set before this moment
    const roomsOpenedAt = Date.now();
    const roomPage = await this.joinFromInvitation(this.userPage);
    const otherRoomPage = await this.joinFromInvitation(this.userPage2);

    const [roomMeeting] = await readRows<{ lockSettings: { disablePrivateChat: boolean; lockOnJoin: boolean } }>(
      roomPage,
      PRIVATE_CHAT_LOCK,
      'meeting',
    );
    expect(
      roomMeeting?.lockSettings,
      `the room should ${inheritLockSettings ? '' : 'not '}take the private chat lock from its parent`,
    ).toEqual({ disablePrivateChat: inheritLockSettings, lockOnJoin: inheritLockSettings });
    expect(
      (await readCurrentUser(roomPage))?.locked,
      `the attendee should join the room ${inheritLockSettings ? 'locked' : 'unlocked'}`,
    ).toBe(inheritLockSettings);

    if (inheritLockSettings) {
      await waitForLockGraceToPass(roomsOpenedAt);
      await PrivateChatRules.expectPrivateChatRefused(
        roomPage,
        otherRoomPage,
        'an attendee should not chat privately with another attendee in the room',
      );
      return;
    }
    await PrivateChatRules.expectPrivateChatDelivered(
      roomPage,
      otherRoomPage,
      'an attendee should chat privately with another attendee in the room',
    );
  }
}
