import { type APIRequestContext, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { graphql, readRows } from '../core/graphql';
import { endMeetings, getRandomInt } from '../core/helpers';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

const PUBLIC_CHAT_ID = 'MAIN-PUBLIC-GROUP-CHAT';
const pollOptions = { timeout: ELEMENT_WAIT_LONGER_TIME };

// The mutations the client sends for each feature (see the matching
// bigbluebutton-html5 mutations.ts files), and the views a participant reads
// the result from. Values travel as variables, as in the client: the actions
// server rejects booleans written inline.
const SEND_CHAT_MESSAGE =
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
const CREATE_PRIVATE_CHAT = 'mutation CreatePrivateChat($userId: String!) { chatCreateWithUser(userId: $userId) }';
const RAISE_HAND =
  'mutation RaiseHand($userId: String!, $raiseHand: Boolean!) { userSetRaiseHand(userId: $userId, raiseHand: $raiseHand) }';
const PUBLIC_MESSAGES = 'subscription { chat_message_public { message } }';
const POLLS = 'subscription { poll { questionText } }';
const TIMER = 'subscription { timer { active } }';
const PRIVATE_CHATS = 'subscription { chat(where: { public: { _eq: false } }) { chatId participantId } }';
const PRIVATE_MESSAGES = 'subscription { chat_message_private { message } }';
const CURRENT_USER = 'subscription { user_current { userId raiseHand } }';

async function getOwnUserId(page: Page): Promise<string> {
  const [user] = await readRows<{ userId: string }>(page, CURRENT_USER, 'user_current');
  return user.userId;
}

// Sends a mutation the way the client does and checks that the GraphQL layer
// passed it on. Polls and private chat eject the sender when the feature is
// disabled, which can close the connection before the answer arrives.
async function sendMutation(page: Page, query: string, field: string, variables?: Record<string, unknown>) {
  const result = await graphql(page, query, variables);
  expect(result.errors, `${field} should not be refused by the GraphQL layer`).toBeUndefined();
  if (!result.closed) expect(result.data?.[field], `${field} should be accepted`).toBe(true);
}

// Sends a request the server accepts (toggling the observer's raised hand) and
// waits until the observer sees it applied. akka-apps handles a meeting's
// messages in order, so by then it has also handled every request sent before.
async function waitForServerToCatchUp(observer: Page) {
  const [{ userId, raiseHand }] = await readRows<{ userId: string; raiseHand: boolean }>(
    observer,
    CURRENT_USER,
    'user_current',
  );
  await sendMutation(observer, RAISE_HAND, 'userSetRaiseHand', { userId, raiseHand: !raiseHand });
  await expect
    .poll(async () => (await readRows<{ raiseHand: boolean }>(observer, CURRENT_USER, 'user_current'))[0]?.raiseHand, {
      ...pollOptions,
      message: 'the server should apply the observer request',
    })
    .toBe(!raiseHand);
}

// Starts a private chat as the client does: create it, then send the first
// message, which is what makes it appear for the receiver. Returns once the
// server has handled both requests.
async function sendPrivateMessage(sender: Page, receiver: Page, message: string) {
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

const getPrivateMessages = async (page: Page) =>
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
