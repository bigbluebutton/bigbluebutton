import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { ALL_STREAMS, recordStreamFrames, StreamCounts, StreamName, StreamRecorder } from '../core/streamRecorder';
import { enableChatPopup, enableUserJoinPopup, saveSettings } from '../notifications/util';
import { openSettings } from '../options/util';
import { MultiUsers } from './multiusers';
import { drawArrow } from './util';

const VICTIM = 'EjectedViewer';
const CONTROL = 'ControlViewer';

/**
 * Coverage for the bbb-graphql-middleware streaming-server authorization gates.
 *
 * The four middleware-managed subscriptions are answered by the middleware rather than forwarded
 * to Hasura, so its own per-send `inMeeting()` check is what limits who receives chat messages,
 * cursor positions, notifications and talking-user names.
 *
 * Asserted on the wire rather than in the DOM: a removed client unmounts its app subtree and shows
 * the meeting-ended modal, so there is nothing left to observe on screen. See
 * core/streamRecorder.ts for why the client's `complete` frames are withheld.
 */
export class EjectedStreams extends MultiUsers {
  private victimRecorder!: StreamRecorder;

  private controlRecorder!: StreamRecorder;

  private controlPage!: Page;

  /** Creates a viewer whose GraphQL socket is proxied, following chat/privateChatListPreview.ts. */
  private async initRecordedViewer(fullName: string): Promise<[Page, StreamRecorder]> {
    const rawPage = await (this.modPage.context ?? this.context).newPage();
    // Installed before init(): init() navigates, and the socket opens during navigation.
    const recorder = await recordStreamFrames(rawPage);
    const viewer = new Page(this.browser, rawPage, this.modPage.testInfo);
    await viewer.init(false, { fullName, meetingId: this.modPage.meetingId });

    // getChatMessageStream is skip-gated client-side (chat-graphql/alert/component.tsx), so its
    // subscription does not exist until the chat popup setting is on. getNotificationStream is not:
    // <Notifications /> mounts unconditionally and subscribes with no skip, and the popup setting
    // only decides whether a toast renders. It is enabled here so the join alert is observable in
    // the DOM, not because the frames depend on it.
    await openSettings(viewer);
    await enableChatPopup(viewer);
    await enableUserJoinPopup(viewer);
    await saveSettings(viewer);

    return [viewer, recorder];
  }

  private async driveChat(index: number) {
    await this.modPage.fill(e.chatBox, `stream-probe-${index}`);
    await this.modPage.waitAndClick(e.sendButton);
  }

  /**
   * Moderator-origin cursors deliberately: cursorVisibleTo() short-circuits the viewer-cursor lock
   * for them, so the assertion isolates the membership gate with no lock-state confound.
   */
  private async driveCursor() {
    await drawArrow(this.modPage);
  }

  /**
   * "Mute all except presenter", which broadcasts NotifyAllInMeetingEvtMsg
   * (MuteAllExceptPresentersCmdMsgHdlr).
   *
   * It has to be a broadcast: NotifyUserInMeetingEvtMsg is addressed by userId, and akka does not
   * target a user it has already removed - so a per-user producer would leave the victim silent
   * for reasons that have nothing to do with the gate under test.
   *
   * Repeatable because the client always sends `muted: true` rather than toggling, and the handler
   * emits the notification on every such message with no state comparison. The handler also mutes
   * whoever is in the voice conference, which is why this driver belongs only to the test that
   * joins no audio - in the voice test it would manufacture the very frames being counted.
   */
  private async driveNotification() {
    await this.openParticipants();
    await this.modPage.waitAndClick(e.muteAllUsers);
  }

  /** The crowd-action buttons live in the participants panel; the chat driver switches away. */
  private async openParticipants() {
    const alreadyOpen = await this.modPage.page
      .locator(e.muteAllUsers)
      .isVisible()
      .catch(() => false);
    if (alreadyOpen) return;
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.hasElement(e.muteAllUsers, 'should reopen the participants panel for the moderator');
  }

  /**
   * Each toggle emits UserVoiceStateEvtMsg. Clicks whichever button is showing rather than
   * assuming a mute state, so the driver stays correct however many times it has run. A moderator
   * speaker also short-circuits the hideUserList branch of voiceStateVisibleTo, leaving the
   * membership gate as the only thing under test.
   */
  private async toggleMic() {
    const mute = this.modPage.page.locator(`${e.muteMicButton}:visible`);
    const unmute = this.modPage.page.locator(`${e.unmuteMicButton}:visible`);
    if ((await mute.count()) > 0) {
      await mute.first().click();
    } else {
      await unmute.first().click();
    }
    // Back-to-back toggles get coalesced and emit nothing; give each transition time to land.
    await this.modPage.page.waitForTimeout(1500);
  }

  private async ejectVictim() {
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    const victimRow = this.modPage.page.locator(e.userListItem).filter({ hasText: VICTIM });
    await victimRow.locator(e.moreOptionsUserItemButton).click();
    // Every row renders its own copy of the menu and the closed ones stay in the DOM, so match the
    // visible item -- the same reason lockViewers.ts filters unlockUserButton by :visible.
    await this.modPage.page.locator(`${e.removeUser}:visible`).first().click();
    await this.modPage.waitAndClick(e.removeUserConfirmationBtn);
    await expect(victimRow, 'the ejected user should leave the moderator user list').toHaveCount(0, {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
  }

  /** The eject leaves the participants panel open; the chat driver needs the chat panel back. */
  private async reopenChat() {
    const chatVisible = await this.modPage.page
      .locator(e.chatBox)
      .isVisible()
      .catch(() => false);
    if (chatVisible) return;
    await this.modPage.waitAndClick(e.messagesSidebarButton);
    await this.modPage.hasElement(e.chatBox, 'should reopen the public chat for the moderator');
  }

  private async assertEjectedScreen() {
    const modal = this.userPage.page.locator(e.meetingEndedModalTitle);
    const errorScreen = this.userPage.page.locator(e.errorScreenMessage);
    await expect(modal.or(errorScreen).first()).toBeVisible({ timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    // ErrorScreen is an ErrorBoundary fallback ABOVE ConnectionManager (client/main.tsx), so that
    // path tears the socket down and the run can conclude nothing. Fail loudly rather than pass
    // vacuously.
    await expect(
      modal,
      'the ejected client must land on the meeting-ended modal; the error screen closes the ' +
        'GraphQL socket, so this run cannot conclude anything',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
  }

  /**
   * Drives activity until one round satisfies every condition at once, then returns.
   *
   * A round only counts when, in the same window: the victim's socket was open, the control viewer
   * (still in the meeting) did receive the driven streams, and the victim received nothing.
   * Checking all three together is what makes the silence attributable to the authorization gate
   * rather than to a dead socket or to a driver that stopped producing events. Deliberately a
   * single window -- an earlier version measured liveness separately from silence and was flaky,
   * because the ejected client reconnects and its socket lifetime is not predictable.
   *
   * Rounds are retried because membership state propagates asynchronously, so frames already in
   * flight immediately after the change are expected and must not fail the run.
   *
   * An explicit loop rather than expect().toPass() so the failure modes stay distinguishable: if
   * the frames never stop, the socket eventually closes on its own, and toPass would report
   * whichever assertion happened to fail last rather than the one that matters.
   */
  private async assertGatedWhileControlReceives(drivenStreams: StreamName[], drive: () => Promise<void>) {
    const deadline = Date.now() + ELEMENT_WAIT_EXTRA_LONG_TIME * 3;
    const victimRounds: StreamCounts[] = [];
    let lastVictim: StreamCounts | null = null;
    let sawLiveRound = false;

    while (Date.now() < deadline) {
      if (!this.victimRecorder.isSocketOpen()) break;

      const victimMark = this.victimRecorder.mark();
      const controlMark = this.controlRecorder.mark();
      await drive();

      const victimSaw = this.victimRecorder.countsSince(victimMark);
      const controlSaw = this.controlRecorder.countsSince(controlMark);
      lastVictim = victimSaw;
      victimRounds.push(victimSaw);

      // The victim seeing nothing only means something if the round produced events at all and the
      // victim's connection was still able to receive them.
      const victimQuiet = ALL_STREAMS.every((stream) => victimSaw[stream] === 0);
      const controlGotEverything = drivenStreams.every((stream) => controlSaw[stream] > 0);

      if (victimQuiet && controlGotEverything && this.victimRecorder.isSocketOpen()) {
        sawLiveRound = true;
        break;
      }
    }

    const leaked = ALL_STREAMS.filter((stream) => (lastVictim?.[stream] ?? 0) > 0);
    expect(
      leaked,
      `an ejected user is still receiving middleware streams: ${JSON.stringify(lastVictim)}. ` +
        `Every round, oldest first: ${JSON.stringify(victimRounds)} -- frames in the earliest ` +
        'rounds are expected while the change propagates; a stream still non-zero in the last ' +
        'round is the leak.',
    ).toEqual([]);

    // A reconnect would put a second socket in the recorder's set, and that socket carries none of
    // the four subscriptions -- they were disposed when the client unmounted. A quiet round
    // measured on it proves nothing, and isSocketOpen() cannot tell the two apart because it is a
    // union over every socket the page has opened.
    expect(
      this.victimRecorder.totalSocketsOpened(),
      'the victim reconnected mid-run, so a quiet round may have been measured on a socket that ' +
        'never carried the middleware subscriptions; this run cannot conclude either way ' +
        `(closes: ${JSON.stringify(this.victimRecorder.closeEvents())})`,
    ).toBe(1);

    expect(
      sawLiveRound,
      "could not establish a window in which the victim's socket was open and the control viewer " +
        'received the driven streams, so this run cannot tell whether the gate works ' +
        `(socket open: ${this.victimRecorder.isSocketOpen()}, ` +
        `closes: ${JSON.stringify(this.victimRecorder.closeEvents())})`,
    ).toBe(true);
  }

  /**
   * @param drivenStreams streams actively produced during the post-eject window. The others are
   * still asserted to be silent, which is free and strictly stronger.
   */
  async ejectedUserStopsReceivingStreams(drivenStreams: StreamName[], drive: () => Promise<void>) {
    // --- positive control: the victim really is receiving these streams while still a member.
    const beforeVictim = this.victimRecorder.mark();
    const beforeControl = this.controlRecorder.mark();
    await drive();

    await expect(async () => {
      const seen = this.victimRecorder.countsSince(beforeVictim);
      for (const stream of drivenStreams) {
        expect(seen[stream], `the victim should receive ${stream} frames before being ejected`).toBeGreaterThan(0);
      }
    }).toPass({ timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    const controlBefore = this.controlRecorder.countsSince(beforeControl);
    for (const stream of drivenStreams) {
      expect(
        controlBefore[stream],
        `the control viewer should receive ${stream} frames before the eject`,
      ).toBeGreaterThan(0);
    }

    expect(
      this.victimRecorder.subscribedOperations(),
      'the victim must be subscribed to the streams under test',
    ).toEqual(expect.arrayContaining(drivenStreams));

    // --- eject
    this.victimRecorder.suppressClientComplete(true);
    this.victimRecorder.keepServerConnectionOpen(true);
    await this.ejectVictim();
    await this.assertEjectedScreen();
    // Costs a few seconds, and the ejected page redirects itself before long, so only pay it when
    // the chat driver actually needs the panel back.
    if (drivenStreams.includes('chat')) await this.reopenChat();

    await this.assertGatedWhileControlReceives(drivenStreams, drive);

    // The client's own unsubscribe would end these streams for reasons unrelated to the checks
    // under test, so confirm the suppression actually ran.
    expect(
      this.victimRecorder.suppressedCompletes(),
      'the ejected client should have tried to unsubscribe and been withheld',
    ).toBeGreaterThan(0);
  }

  async setup() {
    [this.userPage, this.victimRecorder] = await this.initRecordedViewer(VICTIM);
    [this.controlPage, this.controlRecorder] = await this.initRecordedViewer(CONTROL);
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn).catch(() => {
      // Only needed for viewer cursors; the moderator's own cursor is broadcast regardless, and
      // the moderator is the cursor driver here.
    });
  }

  async chatCursorAndNotifications() {
    await this.setup();
    let index = 0;
    await this.ejectedUserStopsReceivingStreams(['chat', 'cursor', 'notification'], async () => {
      index += 1;
      await this.driveNotification();
      await this.reopenChat();
      await this.driveChat(index);
      await this.driveCursor();
    });
  }

  async voice() {
    await this.setup();
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();

    // One toggle per round: the ejected client redirects itself a few seconds after the eject, so
    // a round has to complete quickly enough to land inside that window.
    await this.ejectedUserStopsReceivingStreams(['voice'], async () => {
      await this.toggleMic();
    });
  }
}
