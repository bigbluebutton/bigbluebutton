import { type APIRequestContext, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { getOwnUserId, graphql, readRows, sendMutation, waitForServerToCatchUp } from '../core/graphql';
import { endMeetings, getRandomInt } from '../core/helpers';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

const PUBLIC_CHAT_ID = 'MAIN-PUBLIC-GROUP-CHAT';

// The mutations the client sends for each feature (see the matching
// bigbluebutton-html5 mutations.ts files), and the views a participant reads
// the result from. Values travel as variables, as in the client: the actions
// server rejects booleans written inline.
export const SEND_CHAT_MESSAGE =
  'mutation SendChatMessage($chatId: String!, $message: String!) { chatSendMessage(chatId: $chatId, chatMessageInMarkdownFormat: $message) }';
const CREATE_POLL =
  'mutation CreatePoll($pollId: String!, $pollType: String!, $secretPoll: Boolean!, $question: String!, $multipleResponse: Boolean!, $quiz: Boolean!, $answers: [String]!) { pollCreate(pollId: $pollId, pollType: $pollType, secretPoll: $secretPoll, question: $question, multipleResponse: $multipleResponse, quiz: $quiz, answers: $answers) }';
const pollVariables = (question: string) => ({
  pollId: 'yes-no',
  pollType: 'YN',
  secretPoll: false,
  question,
  multipleResponse: false,
  quiz: false,
  answers: [],
});
const ACTIVATE_TIMER =
  'mutation ActivateTimer($stopwatch: Boolean!, $running: Boolean!, $time: Int!) { timerActivate(stopwatch: $stopwatch, running: $running, time: $time) }';
const timerVariables = { stopwatch: true, running: false, time: 300000 };
export const CREATE_PRIVATE_CHAT =
  'mutation CreatePrivateChat($userId: String!) { chatCreateWithUser(userId: $userId) }';
const PUBLIC_MESSAGES = 'subscription { chat_message_public { message } }';
const POLLS = 'subscription { poll { questionText } }';
const TIMER = 'subscription { timer { active } }';
export const PRIVATE_CHATS = 'subscription { chat(where: { public: { _eq: false } }) { chatId participantId } }';
export const PRIVATE_MESSAGES = 'subscription { chat_message_private { message } }';

// The requests the Permissions and Policies modal and the user list send to lock viewers
const SET_LOCK_SETTINGS =
  'mutation SetLockSettings($disableCam: Boolean!, $disableMic: Boolean!, $disablePrivChat: Boolean!, $disablePubChat: Boolean!, $disableNotes: Boolean!, $hideUserList: Boolean!, $hideViewersCursor: Boolean!, $lockOnJoin: Boolean!, $lockOnJoinConfigurable: Boolean!, $hideViewersAnnotation: Boolean!, $presenterPolicy: String!) { meetingLockSettingsSetProps(disableCam: $disableCam, disableMic: $disableMic, disablePrivChat: $disablePrivChat, disablePubChat: $disablePubChat, disableNotes: $disableNotes, hideUserList: $hideUserList, lockOnJoin: $lockOnJoin, lockOnJoinConfigurable: $lockOnJoinConfigurable, hideViewersCursor: $hideViewersCursor, hideViewersAnnotation: $hideViewersAnnotation, presenterPolicy: $presenterPolicy) }';
const SET_WEBCAMS_ONLY_FOR_MODERATOR =
  'mutation SetWebcamOnlyForModerator($webcamsOnlyForModerator: Boolean!) { meetingSetWebcamOnlyForModerator(webcamsOnlyForModerator: $webcamsOnlyForModerator) }';
const SET_USER_LOCKED =
  'mutation SetUserLocked($userId: String!, $locked: Boolean!) { userSetLocked(userId: $userId, locked: $locked) }';
const EVERY_LOCK_REQUESTED = {
  disableCam: true,
  disableMic: true,
  disablePrivChat: true,
  disablePubChat: true,
  disableNotes: true,
  hideUserList: true,
  hideViewersCursor: true,
  hideViewersAnnotation: true,
  lockOnJoin: true,
  lockOnJoinConfigurable: false,
  presenterPolicy: 'moderatorOnly',
};
// The same restrictions as create parameters
const EVERY_LOCK_CREATE_PARAMETER = [
  'lockSettingsDisableCam=true',
  'lockSettingsDisableMic=true',
  'lockSettingsDisablePrivateChat=true',
  'lockSettingsDisablePublicChat=true',
  'lockSettingsDisableNotes=true',
  'lockSettingsHideUserList=true',
  'lockSettingsHideViewersCursor=true',
  'lockSettingsHideViewersAnnotation=true',
  'lockSettingsLockOnJoin=true',
  'lockSettingsPresenterPolicy=moderatorOnly',
  'webcamsOnlyForModerator=true',
].join('&');
// The lock settings a participant reads (bbb-graphql-server v_meeting_lockSettings)
const LOCK_SETTINGS = `subscription { meeting { lockSettings {
  disableCam disableMic disablePrivateChat disablePublicChat disableNotes hideUserList hideViewersCursor
  hideViewersAnnotation lockOnJoin presenterPolicy webcamsOnlyForModerator hasActiveLockSetting
} } }`;
const OWN_LOCK = 'subscription { user_current { locked } }';
interface LockSettings {
  disableCam: boolean;
  disableMic: boolean;
  disablePrivateChat: boolean;
  disablePublicChat: boolean;
  disableNotes: boolean;
  hideUserList: boolean;
  hideViewersCursor: boolean;
  hideViewersAnnotation: boolean;
  lockOnJoin: boolean;
  presenterPolicy: string;
  webcamsOnlyForModerator: boolean;
  hasActiveLockSetting: boolean;
}
const NOTHING_LOCKED: LockSettings = {
  disableCam: false,
  disableMic: false,
  disablePrivateChat: false,
  disablePublicChat: false,
  disableNotes: false,
  hideUserList: false,
  hideViewersCursor: false,
  hideViewersAnnotation: false,
  lockOnJoin: false,
  presenterPolicy: 'requireApproval',
  webcamsOnlyForModerator: false,
  hasActiveLockSetting: false,
};
const EVERYTHING_LOCKED: LockSettings = {
  disableCam: true,
  disableMic: true,
  disablePrivateChat: true,
  disablePublicChat: true,
  disableNotes: true,
  hideUserList: true,
  hideViewersCursor: true,
  hideViewersAnnotation: true,
  lockOnJoin: true,
  presenterPolicy: 'moderatorOnly',
  webcamsOnlyForModerator: true,
  hasActiveLockSetting: true,
};

// What a participant reads about the locks: the meeting's lock settings and whether they bind them
async function readLocks(page: Page): Promise<{ lockSettings?: LockSettings; locked?: boolean }> {
  const [meeting] = await readRows<{ lockSettings: LockSettings }>(page, LOCK_SETTINGS, 'meeting');
  const [user] = await readRows<{ locked: boolean }>(page, OWN_LOCK, 'user_current');
  return { lockSettings: meeting?.lockSettings, locked: user?.locked };
}

// Starts a private chat as the client does: create it, then send the first
// message, which is what makes it appear for the receiver. Returns once the
// server has handled both requests.
export async function sendPrivateMessage(sender: Page, receiver: Page, message: string) {
  const receiverId = await getOwnUserId(receiver);
  await sendMutation(sender, CREATE_PRIVATE_CHAT, 'chatCreateWithUser', { userId: receiverId });
  await waitForServerToCatchUp(receiver);
  // read without asserting: a sender ejected for the attempt cannot read anymore
  const { data } = await graphql(sender, PRIVATE_CHATS);
  const chats = (data?.chat ?? []) as { chatId: string; participantId: string }[];
  const chat = chats.find((row) => row.participantId === receiverId);
  if (!chat) return;
  await sendMutation(sender, SEND_CHAT_MESSAGE, 'chatSendMessage', { chatId: chat.chatId, message });
  await waitForServerToCatchUp(receiver);
}

export const getPrivateMessages = async (page: Page) =>
  (await readRows<{ message: string }>(page, PRIVATE_MESSAGES, 'chat_message_private')).map((row) => row.message);

export class APIDisabledFeatures extends MultiUsers {
  // Creates the meeting with `createParameter`, joins the moderator and one or
  // two attendees, runs the check and ends the meeting.
  private async withMeeting(
    page: PlaywrightPage,
    testInfo: TestInfo,
    request: APIRequestContext,
    { createParameter, secondAttendee = false }: { createParameter?: string; secondAttendee?: boolean },
    check: () => Promise<void>,
  ) {
    await this.initModPage(page, { testInfo, createParameter });
    try {
      await this.initUserPage(this.modPage.context, { testInfo });
      if (secondAttendee) await this.initUserPage2(this.modPage.context, { testInfo });
      await check();
    } finally {
      await endMeetings(request, [this.modPage.meetingId]);
    }
  }

  // disabledFeatures=chat: a public chat message sent directly is dropped
  async testChatMessageDropped(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.withMeeting(page, testInfo, request, { createParameter: 'disabledFeatures=chat' }, async () => {
      const message = `disabled-chat-${getRandomInt(1000000, 10000000)}`;
      await sendMutation(this.modPage, SEND_CHAT_MESSAGE, 'chatSendMessage', { chatId: PUBLIC_CHAT_ID, message });
      await waitForServerToCatchUp(this.userPage);
      const messages = await readRows<{ message: string }>(this.userPage, PUBLIC_MESSAGES, 'chat_message_public');
      expect(
        messages.map((row) => row.message),
        'the attendee should not receive the public chat message',
      ).not.toContain(message);
    });
  }

  // disabledFeatures=polls: a poll started directly does not reach the attendee
  async testPollNotStarted(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.withMeeting(page, testInfo, request, { createParameter: 'disabledFeatures=polls' }, async () => {
      const question = `disabled-poll-${getRandomInt(1000000, 10000000)}`;
      await sendMutation(this.modPage, CREATE_POLL, 'pollCreate', pollVariables(question));
      await waitForServerToCatchUp(this.userPage);
      const polls = await readRows<{ questionText: string }>(this.userPage, POLLS, 'poll');
      expect(
        polls.map((row) => row.questionText),
        'the attendee should not see the poll',
      ).not.toContain(question);
    });
  }

  // disabledFeatures=timer: a timer activated directly stays inactive
  async testTimerNotActivated(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.withMeeting(page, testInfo, request, { createParameter: 'disabledFeatures=timer' }, async () => {
      await sendMutation(this.modPage, ACTIVATE_TIMER, 'timerActivate', timerVariables);
      await waitForServerToCatchUp(this.userPage);
      const timers = await readRows<{ active: boolean }>(this.userPage, TIMER, 'timer');
      expect(
        timers.filter((row) => row.active),
        'the attendee should not see an active timer',
      ).toHaveLength(0);
    });
  }

  // disabledFeatures=privateChat: a private chat between two attendees does
  // not reach the second attendee
  async testPrivateChatNotCreated(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const options = { createParameter: 'disabledFeatures=privateChat', secondAttendee: true };
    await this.withMeeting(page, testInfo, request, options, async () => {
      const message = `disabled-private-chat-${getRandomInt(1000000, 10000000)}`;
      await sendPrivateMessage(this.userPage, this.userPage2, message);
      expect(
        await getPrivateMessages(this.userPage2),
        'the second attendee should not receive the message',
      ).not.toContain(message);
      const chats = await readRows<{ participantId: string }>(this.userPage2, PRIVATE_CHATS, 'chat');
      expect(chats, 'the second attendee should not get a private chat').toHaveLength(0);
    });
  }

  // Sends, as the moderator, every request that locks viewers: the meeting's lock settings,
  // "webcams only for moderators" and the lock of the attendee, flipped from `attendeeLocked`.
  private async sendLockRequests(attendeeLocked: boolean) {
    const attendeeId = await getOwnUserId(this.userPage);
    await sendMutation(this.modPage, SET_LOCK_SETTINGS, 'meetingLockSettingsSetProps', EVERY_LOCK_REQUESTED);
    await sendMutation(this.modPage, SET_WEBCAMS_ONLY_FOR_MODERATOR, 'meetingSetWebcamOnlyForModerator', {
      webcamsOnlyForModerator: true,
    });
    await sendMutation(this.modPage, SET_USER_LOCKED, 'userSetLocked', {
      userId: attendeeId,
      locked: !attendeeLocked,
    });
    await waitForServerToCatchUp(this.userPage);
  }

  // disabledFeatures=lockSettings: the lock create parameters are not applied, and
  // lock requests sent directly change nothing
  async testLockSettingsStayOff(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const createParameter = `disabledFeatures=lockSettings&${EVERY_LOCK_CREATE_PARAMETER}`;
    await this.withMeeting(page, testInfo, request, { createParameter }, async () => {
      expect(
        await readLocks(this.userPage),
        'the attendee should join a meeting without locks, whatever the lock create parameters say',
      ).toEqual({ lockSettings: NOTHING_LOCKED, locked: false });

      await this.sendLockRequests(false);
      expect(
        await readLocks(this.userPage),
        'the attendee should see no lock after the moderator requested every one of them',
      ).toEqual({ lockSettings: NOTHING_LOCKED, locked: false });
    });
  }

  // Positive control for the test above: in a meeting without disabledFeatures
  // the same lock requests take effect, so that test can fail.
  async testLockRequestsTakeEffectWhenEnabled(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.withMeeting(page, testInfo, request, {}, async () => {
      // lockSettingsLockOnJoin defaults to true: the attendee joins bound by the locks to come
      const { locked } = await readLocks(this.userPage);
      expect(locked, 'the attendee should join locked').toBe(true);

      await this.sendLockRequests(true);
      await expect
        .poll(() => readLocks(this.userPage), {
          timeout: ELEMENT_WAIT_LONGER_TIME,
          message: 'the attendee should see every lock the moderator requested, and their own lock lifted',
        })
        .toEqual({ lockSettings: EVERYTHING_LOCKED, locked: false });
    });
  }

  // Positive control for the tests above: in a meeting without disabledFeatures
  // the same requests take effect, so those tests can fail.
  async testRequestsTakeEffectWhenEnabled(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.withMeeting(page, testInfo, request, { secondAttendee: true }, async () => {
      const observer = this.userPage2;
      const message = `enabled-chat-${getRandomInt(1000000, 10000000)}`;
      const question = `enabled-poll-${getRandomInt(1000000, 10000000)}`;
      const privateMessage = `enabled-private-chat-${getRandomInt(1000000, 10000000)}`;

      await sendMutation(this.modPage, SEND_CHAT_MESSAGE, 'chatSendMessage', { chatId: PUBLIC_CHAT_ID, message });
      await sendMutation(this.modPage, CREATE_POLL, 'pollCreate', pollVariables(question));
      await sendMutation(this.modPage, ACTIVATE_TIMER, 'timerActivate', timerVariables);
      await sendPrivateMessage(this.userPage, observer, privateMessage);

      const messages = await readRows<{ message: string }>(observer, PUBLIC_MESSAGES, 'chat_message_public');
      expect(
        messages.map((row) => row.message),
        'the attendee should receive the public chat message',
      ).toContain(message);
      const polls = await readRows<{ questionText: string }>(observer, POLLS, 'poll');
      expect(
        polls.map((row) => row.questionText),
        'the attendee should see the poll',
      ).toContain(question);
      const timers = await readRows<{ active: boolean }>(observer, TIMER, 'timer');
      expect(
        timers.some((row) => row.active),
        'the attendee should see an active timer',
      ).toBe(true);
      expect(await getPrivateMessages(observer), 'the second attendee should receive the private message').toContain(
        privateMessage,
      );
    });
  }
}
