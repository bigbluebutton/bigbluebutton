import { type ConsoleMessage, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';

import { connectMicrophone } from '../audio/util';
import {
  APOLLO_CLIENT_SETTINGS_MODULE,
  expectLiveKitMembership,
  field,
  getLiveKitMembershipRows,
  getOwnMeetingId,
  isApolloClientExposed,
  type LiveKitMembershipRow,
  queryDocument,
  runMutation,
  runQuery,
  stringVarMutation,
} from '../core/apolloProbe';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { getMicPlacement } from '../core/livekit';
import { Page } from '../core/page';
import { Join } from './join';

// Purposes carried by the user_livekit_room memberships.
const BREAKOUT_LISTEN_PURPOSE = 'breakout-listen';
const PRIMARY_PURPOSE = 'primary';
const TRANSFER_MUTATION = 'userTransferVoiceToMeeting';
const NONEXISTENT_MEETING_ID = 'nonexistent-meeting-id-e2e';
// Debounce for mute-toggle clicks (see client's input-stream-live-selector/service.ts).
const MUTE_TOGGLE_DEBOUNCE = 500;
// Apollo probe throttling
const PROBE_SAMPLE_INTERVAL = 500;

// Reads the breakout rooms of the parent meeting. `breakoutRoomMeetingId` is the
// internal meetingId used as the roomName of a breakout-listen membership row,
// while `shortName` is what the listen toast carries in data-room-name.
const BREAKOUT_ROOM_QUERY = queryDocument([
  field('breakoutRoom', [field('breakoutRoomMeetingId'), field('shortName'), field('sequence')]),
]);

// Which breakout room the lone attendee was randomly assigned to. A moderator's
// breakoutRoom subscription carries assignedUsers for every room, so the assigned
// sequence is whichever room holds an assigned user.
const ASSIGNED_ROOM_QUERY = queryDocument([
  field('breakoutRoom', [field('sequence'), field('assignedUsers', [field('userId')])]),
]);

interface BreakoutRoomInfo {
  meetingId: string;
  shortName: string;
  sequence: number;
}

export class Listen extends Join {
  async initModAndUser(page: PlaywrightPage, testInfo: TestInfo): Promise<void> {
    await this.initModPage(page, { testInfo, createModules: APOLLO_CLIENT_SETTINGS_MODULE });
    await this.initUserPage(this.context, { testInfo });
  }

  // -- Apollo probe wrappers --

  // eslint-disable-next-line class-methods-use-this
  async getBreakoutRooms(page: PlaywrightPage): Promise<BreakoutRoomInfo[]> {
    const data = await runQuery(page, BREAKOUT_ROOM_QUERY);
    const rows = (data.breakoutRoom ?? []) as Array<{
      breakoutRoomMeetingId: string;
      shortName: string;
      sequence: number;
    }>;

    return rows.map((row) => ({
      meetingId: row.breakoutRoomMeetingId,
      shortName: row.shortName,
      sequence: row.sequence,
    }));
  }

  async resolveBreakout(sequence: number): Promise<BreakoutRoomInfo> {
    if (!this?.modPage) throw new Error('modPage not initialized');
    let match: BreakoutRoomInfo | undefined;

    await expect(async () => {
      const rooms = await this.getBreakoutRooms(this.modPage.page);
      match = rooms.find((room) => room.sequence === sequence);
      expect(match, `breakout room with sequence ${sequence} should exist`).toBeDefined();
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

    if (!match) throw new Error(`breakout room sequence ${sequence} not found`);

    return match;
  }

  // Which room the lone attendee was randomly assigned to: exactly one room
  // holds an assigned user (moderators are never assigned in this test).
  async resolveAssignedSequence(): Promise<number> {
    if (!this?.modPage) throw new Error('modPage not initialized');

    let sequence: number | undefined;

    await expect(async () => {
      const data = await runQuery(this.modPage.page, ASSIGNED_ROOM_QUERY);
      const rows = (data.breakoutRoom ?? []) as Array<{
        sequence: number;
        assignedUsers: Array<{ userId: string }>;
      }>;
      const assigned = rows.filter((row) => (row.assignedUsers?.length ?? 0) > 0);
      expect(assigned, 'exactly one breakout room should hold the randomly-assigned attendee').toHaveLength(1);
      sequence = assigned[0].sequence;
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

    if (sequence === undefined) throw new Error('assigned breakout sequence not resolved');

    return sequence;
  }

  // eslint-disable-next-line class-methods-use-this
  async getBreakoutListenRows(page: PlaywrightPage): Promise<LiveKitMembershipRow[]> {
    const rows = await getLiveKitMembershipRows(page);

    return rows.filter((row) => row.purpose === BREAKOUT_LISTEN_PURPOSE);
  }

  // -- Suite primitives --

  // Moderator creates two default breakout rooms with the attendee randomly
  // assigned to one of them; the attendee joins that room with a microphone and
  // is talking there. Returns the joined page plus the resolved assigned sequence.
  async setup(): Promise<{ breakoutUserPage: Page; assignedSequence: number }> {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const assignedSequence = await this.createBreakoutAssignedToAttendee();
    const breakoutUserPage = await this.joinRoom(true);
    await breakoutUserPage.hasElement(e.isTalking, `attendee should be talking in breakout room ${assignedSequence}`);

    return { breakoutUserPage, assignedSequence };
  }

  // Suite-local replacement for Create.create(): drag-drop assignment flakes
  // under parallel-worker load, so use the modal's random assignment. The
  // attendee then lands in EITHER room (resolveAssignedSequence reads it
  // back), and the cross-client invite is waited out with a one-shot reload
  // recovery. Returns the assigned sequence.
  private async createBreakoutAssignedToAttendee(): Promise<number> {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    // randomlyAssign only mounts once the create panel has fully rendered;
    // waiting to click it settles the panel without a fixed sleep.
    await this.modPage.waitAndClick(e.randomlyAssign, ELEMENT_WAIT_EXTRA_LONG_TIME);
    const createButton = this.modPage.page.locator(e.createBreakoutRoomsButton);
    await expect(createButton, 'random assignment should enable the create button').toBeEnabled({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);

    const assignedSequence = await this.resolveAssignedSequence();

    await this.waitForInviteWithReload();
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.userPage.hasElement(
      e.breakoutRoomSidebarButton,
      'should display the breakout room sidebar button for the attendee after rooms are created',
    );
    return assignedSequence;
  }

  // Waits out the attendee's join-breakout invite generously, then recovers once
  // by reloading. The invitation is server-persisted (breakoutRoom.showInvitation)
  // and the dialog's "dismissed" flag is client-only React state that resets on
  // load, so an invite that lost the first render's round-trip race re-renders
  // after a reload. Reload re-opens the auto-join audio modal, so clear it before
  // waiting so the subsequent joinRoom() can reopen it.
  private async waitForInviteWithReload(): Promise<void> {
    if (!this?.userPage) throw new Error('userPage not initialized');

    const appeared = await this.userPage.page
      .locator(e.modalConfirmButton)
      .waitFor({ state: 'visible', timeout: ELEMENT_WAIT_LONGER_TIME })
      .then(
        () => true,
        () => false,
      );

    if (appeared) return;

    await this.userPage.page.reload();
    await this.dismissAudioModalIfPresent(this.userPage);
    await this.userPage.hasElement(
      e.modalConfirmButton,
      'attendee join-breakout invite should re-render after a one-shot reload',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // Reaches the steady listen state: attendee talking in their assigned breakout,
  // the moderator with a connected (muted) mic in main, listening to that breakout.
  async reachListen(): Promise<{ breakoutUserPage: Page; room: BreakoutRoomInfo }> {
    const { breakoutUserPage, assignedSequence } = await this.setup();
    await this.connectModMicrophone();
    const room = await this.listenToRoom(assignedSequence);

    return { breakoutUserPage, room };
  }

  async listenToRoom(sequence: number): Promise<BreakoutRoomInfo> {
    if (!this?.modPage) throw new Error('modPage not initialized');

    const room = await this.resolveBreakout(sequence);
    await this.openRoomListenMenu(sequence);
    await this.expectListenToast(room.shortName);
    await expectLiveKitMembership(
      this.modPage.page,
      { roomName: room.meetingId, purpose: BREAKOUT_LISTEN_PURPOSE },
      `moderator should hold a breakout-listen membership for "${room.shortName}"`,
      ELEMENT_WAIT_LONGER_TIME,
    );

    return room;
  }

  async returnToMain(): Promise<void> {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.breakoutTransferReturnButton);
    await this.modPage.wasRemoved(
      e.breakoutListenToast,
      'breakout-listen toast should be dismissed after returning to main',
    );
    await this.expectNoBreakoutListenRows(
      this.modPage.page,
      'no breakout-listen membership should remain after returning to main',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  private async connectModMicrophone(): Promise<void> {
    await this.modPage.page.bringToFront();
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
  }

  private async openRoomListenMenu(sequence: number): Promise<void> {
    await this.ensureRoomOptionsVisible();
    await this.modPage.waitAndClick(this.roomOptionsSelector(sequence));
    await this.modPage.waitAndClick(`li[data-test="listenToBreakoutRoomButton${sequence}"]`);
  }

  private async ensureRoomOptionsVisible(): Promise<void> {
    if (!this?.modPage) throw new Error('modPage not initialized');

    const roomOptions1 = this.modPage.page.locator(e.roomOptions1);

    const optionsVisible = await roomOptions1
      .waitFor({ state: 'visible', timeout: ELEMENT_WAIT_TIME })
      .then(() => true)
      .catch(() => false);
    if (optionsVisible) return;

    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await expect(roomOptions1, 'breakout running-room options should be visible').toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private roomOptionsSelector(sequence: number): string {
    if (sequence === 1) return e.roomOptions1;
    if (sequence === 2) return e.roomOptions2;

    throw new Error(`no roomOptions selector for breakout sequence ${sequence}`);
  }

  // -- Assertions --

  private async expectListenToast(shortName: string): Promise<void> {
    const toast = this.modPage.page.locator(`${e.breakoutListenToast}[data-room-name="${shortName}"]`);
    await expect(toast, `breakout-listen toast should identify room "${shortName}"`).toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
  }

  async expectExactlyOneBreakoutListenRow(meetingId: string): Promise<void> {
    await expect(async () => {
      const rows = await this.getBreakoutListenRows(this.modPage.page);
      expect(rows, 'exactly one breakout-listen membership should exist').toHaveLength(1);
      expect(rows[0].roomName, 'the breakout-listen membership should target the listened room').toBe(meetingId);
      expect(rows[0].hasToken, 'the breakout-listen membership should carry a token').toBe(true);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
  }

  private async expectNoBreakoutListenRows(page: PlaywrightPage, message: string, timeout: number): Promise<void> {
    await expect(async () => {
      const rows = await this.getBreakoutListenRows(page);
      expect(rows, message).toHaveLength(0);
    }).toPass({ timeout });
  }

  // Count of active talking indicators visible on the breakout side. With two
  // participants (attendee + transferred moderator) this distinguishes "only the
  // attendee talking" (1) from "the moderator is also heard" (2) without relying
  // on the moderator's rendered name inside the breakout.
  // eslint-disable-next-line class-methods-use-this
  private async expectBreakoutActiveTalkers(
    breakoutUserPage: Page,
    count: number,
    message: string,
    timeout = ELEMENT_WAIT_LONGER_TIME,
  ): Promise<void> {
    await expect(async () => {
      const talkers = await breakoutUserPage.page.locator(`${e.isTalking}:visible`).count();
      expect(talkers, message).toBe(count);
    }).toPass({ timeout });
  }

  // Dead-track detector. The moderator is left UNMUTED when switching back to main room,
  // so once their audio returns to main they must show as talking on their
  // OWN page with NO mute/unmute interaction.
  private async expectModTalkingInMainWithoutRecovery(): Promise<void> {
    await this.modPage.checkUserTalkingIndicator();
  }

  // Recovery assertion (kept separate, after the dead track detector): a mute->unmute cycle
  // forces a fresh publish into the main room. Even where a dead first publish
  // leaves silence, the toggle must recover talking.
  private async expectModRecoversTalkingAfterToggle(): Promise<void> {
    if (await this.modPage.checkElement(e.muteMicButton)) {
      await this.modPage.waitAndClick(e.muteMicButton);
      await this.modPage.hasElement(e.unmuteMicButton, 'moderator mic should read muted before re-arming');
      await this.modPage.page.waitForTimeout(MUTE_TOGGLE_DEBOUNCE);
    }
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.checkUserTalkingIndicator();
  }

  // Detector first, then the recovery toggle as a distinct check.
  private async expectModCanTalkInMainAgain(): Promise<void> {
    await this.expectModTalkingInMainWithoutRecovery();
    await this.expectModRecoversTalkingAfterToggle();
  }

  // -- Test cases --

  async goldenPath(): Promise<void> {
    const { breakoutUserPage, room } = await this.reachListen();

    // The listen transfer must create exactly one valid breakout-listen
    // membership for the listened room.
    await this.expectExactlyOneBreakoutListenRow(room.meetingId);

    // Moderator unmutes: the attendee inside the breakout must now hear them (a
    // second active talker), while the moderator's own main-room page must show
    // no talking.
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.expectBreakoutActiveTalkers(
      breakoutUserPage,
      2,
      'attendee should hear the moderator (attendee + moderator talking) in the breakout',
    );
    await this.modPage.wasRemoved(
      e.isTalking,
      "moderator's own main-room page should show no talking while their audio is in the breakout (isolation)",
    );

    // Moderator mid-listen mute/unmute flips the attendee-side talking UI (should now
    // be absent); the listen in toast for the mod persists.
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.expectBreakoutActiveTalkers(
      breakoutUserPage,
      1,
      'attendee-side moderator talking should clear when the moderator mutes',
    );
    await this.modPage.hasElement(e.breakoutListenToast, 'listen toast should persist while muted mid-listen');

    // toggleMuteMicrophone is debounced (leading, no trailing) by
    // MUTE_TOGGLE_DEBOUNCE: an unmute landing within that window of the preceding
    // mute is dropped outright (no mutation sent), leaving the moderator stuck
    // muted. expectBreakoutActiveTalkers(1) above can settle in well under the
    // debounce, so wait it out before unmuting — mirrors expectModRecoversTalkingAfterToggle.
    await this.modPage.page.waitForTimeout(MUTE_TOGGLE_DEBOUNCE);
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.expectBreakoutActiveTalkers(
      breakoutUserPage,
      2,
      'attendee-side moderator talking should return when the moderator unmutes',
    );

    // Return to main via the toast button; the transfer state must fully switch back.
    await this.returnToMain();

    // After returning, the moderator must be able to publish to the main room
    // again (talking indicator on their own page).
    await this.expectModCanTalkInMainAgain();
  }

  async reloadDuringListen(): Promise<void> {
    const { breakoutUserPage, room } = await this.reachListen();

    // A client reload must not tear down the server-side breakout-listen membership
    // (ie persist between reconns/rejoins)
    await this.modPage.page.reload();
    expect(
      await isApolloClientExposed(this.modPage.page, ELEMENT_WAIT_LONGER_TIME),
      'Apollo client should be re-exposed after the reload',
    ).toBe(true);
    await this.expectExactlyOneBreakoutListenRow(room.meetingId);

    // Finish the reload (dismiss the re-shown audio modal) and confirm the toast
    // remounts for the same room and the membership still carries a token.
    await this.dismissAudioModalIfPresent(this.modPage);
    await this.expectListenToast(room.shortName);
    await this.expectExactlyOneBreakoutListenRow(room.meetingId);

    // The secondary room mount on reload can precede the audio bridge init, so
    // the auto-rejoined mic must still publish into the breakout; heard by the
    // attendee there, silent on the moderator's own main-room page. The audio
    // session auto-rejoins muted after the reload; wait for the muted-mic
    // control instead of re-joining.
    await this.modPage.hasElement(
      e.unmuteMicButton,
      'moderator audio should auto-rejoin (muted) after the reload',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.expectBreakoutActiveTalkers(
      breakoutUserPage,
      2,
      'attendee should hear the moderator in the breakout after the reload (mic re-attached)',
    );
    await this.modPage.wasRemoved(
      e.isTalking,
      "moderator's own main-room page should show no talking after the post-reload mic join (isolation)",
    );
  }

  async breakoutEndDuringListen(): Promise<void> {
    await this.reachListen();

    // Leave the moderator unmuted through the switch back so the post-breakout end
    // talking assertion is a genuine dead-track probe (continuous fake speech, no
    // recovery toggle) rather than a muted no-op. reachListen leaves the mic muted.
    await this.modPage.waitAndClick(e.unmuteMicButton);

    // Ending all breakouts must auto-switch back the listen transfer.
    await this.endAllBreakoutRooms();
    await this.modPage.wasRemoved(
      e.breakoutListenToast,
      'breakout-listen toast should auto-dismiss when breakouts end',
    );
    await this.expectNoBreakoutListenRows(
      this.modPage.page,
      'no breakout-listen membership should remain after breakouts end',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // The moderator can be heard in the main room again.
    await this.expectModCanTalkInMainAgain();
  }

  async singleActiveAutoSwitch(): Promise<void> {
    const { assignedSequence } = await this.setup();
    await this.connectModMicrophone();

    // A publish abandoned by a superseding mic-room switch must never escalate
    // into a reconnect of the CURRENT room; watch for the fatal-publish
    // reconnect path across the whole switch sequence.
    const fatalReconnects: string[] = [];
    const onConsole = (msg: ConsoleMessage) => {
      if (msg.text().includes('livekit_audio_fatal_publish_error_reconnect')) {
        fatalReconnects.push(msg.text());
      }
    };
    this.modPage.page.on('console', onConsole);

    try {
      // Listen first to the attendee's room, then switch to the OTHER (empty) room.
      const firstRoom = await this.listenToRoom(assignedSequence);
      const otherSequence = assignedSequence === 1 ? 2 : 1;
      const secondRoom = await this.resolveBreakout(otherSequence);

      await this.modPage.waitAndClick(e.unmuteMicButton);
      await this.modPage.hasElement(e.muteMicButton, 'the moderator should be unmuted before switching rooms');

      // Trigger listen on the other room while still listening to the first.
      await this.openRoomListenMenu(otherSequence);

      // Single-active rule: memberships converge to EXACTLY ONE breakout-listen
      // row (the second room) and there must never be two concurrent rows.
      await this.expectSingleActiveConvergence(
        secondRoom.meetingId,
        secondRoom.shortName,
        ELEMENT_WAIT_EXTRA_LONG_TIME,
      );

      // The toast switches to the second room and the first room toast is gone.
      await this.expectListenToast(secondRoom.shortName);
      await this.modPage.wasRemoved(
        `${e.breakoutListenToast}[data-room-name="${firstRoom.shortName}"]`,
        'the first room listen toast should be replaced by the second room toast',
      );

      // One microphone, one room: the switch must hand the mic to the second
      // room and leave none behind.
      await expect(async () => {
        const placement = await getMicPlacement(this.modPage.page);
        const target = placement.find((room) => room.name === secondRoom.meetingId);
        const primary = placement.find((room) => room.primary);

        expect(target?.mics ?? 0, 'the mic must be published in the room being listened to').toBe(1);
        expect(primary?.mics ?? 0, 'the mic must NOT be published in the main room').toBe(0);
        expect(placement.filter((room) => room.mics > 0).length, 'the mic must be published in exactly one room').toBe(
          1,
        );
      }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

      // The audio session survived the switches (no fatal-publish escalation
      // reconnected the primary): the mic control is still mounted. Starting a
      // listen leaves the moderator muted in the room they land in, switch or
      // not, so the muted control is the expected one here.
      await this.modPage.hasElement(
        e.unmuteMicButton,
        'the moderator audio session should remain intact after switching listens',
      );
      expect(fatalReconnects, 'no fatal-publish reconnect should fire during listen switches').toHaveLength(0);
    } finally {
      this.modPage.page.off('console', onConsole);
    }
  }

  async adversarialNonexistentTarget(): Promise<void> {
    const parentMeetingId = await this.reachMainWithAudioAndPrimary();

    // Adversarial: transfer from the real parent meeting to a non-existent target.
    await this.fireTransfer(parentMeetingId, NONEXISTENT_MEETING_ID);

    // Expected behavior: no probe-visible breakout-listen row, the primary
    // membership survives, and the client stays functional.
    await this.expectNoBreakoutListenRowStable(this.modPage.page, ELEMENT_WAIT_LONGER_TIME);
    await this.expectPrimaryMembership(
      this.modPage.page,
      'primary membership must survive an invalid transfer target',
      ELEMENT_WAIT_TIME,
    );
    await this.modPage.hasElement(
      e.audioDropdownMenu,
      'audio controls should remain functional after an invalid transfer',
    );
  }

  async adversarialTransferToSelf(): Promise<void> {
    const parentMeetingId = await this.reachMainWithAudioAndPrimary();

    // Adversarial: transfer from the parent meeting to the SAME parent meeting.
    await this.fireTransfer(parentMeetingId, parentMeetingId);

    // The primary membership must survive (no self-delete), no listen-in state
    // may be created for the parent meeting, and the moderator must NOT be
    // kicked from audio.
    await this.expectPrimaryMembershipStable(this.modPage.page, ELEMENT_WAIT_LONGER_TIME);
    await this.expectNoBreakoutListenRowStable(this.modPage.page, ELEMENT_WAIT_TIME);
    await this.modPage.wasRemoved(e.breakoutListenToast, 'a self-transfer must not raise a listen-in toast');
    await this.modPage.hasElement(e.audioDropdownMenu, 'moderator should not be kicked from audio by a self-transfer');
  }

  private async reachMainWithAudioAndPrimary(): Promise<string> {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.expectPrimaryMembership(
      this.modPage.page,
      'moderator should hold a primary membership before the adversarial transfer',
      ELEMENT_WAIT_LONGER_TIME,
    );
    // The transfer action keys on the INTERNAL meetingId (Page.meetingId is the
    // external create/join id). Read the real one so the self-transfer exercises
    // the parent -> parent path instead of the unknown-breakout guard.
    return getOwnMeetingId(this.modPage.page);
  }

  private async fireTransfer(fromMeetingId: string, toMeetingId: string): Promise<void> {
    const result = await runMutation(
      this.modPage.page,
      stringVarMutation(TRANSFER_MUTATION, { fromMeetingId, toMeetingId }),
    );

    // Positive control: the adversarial cases assert on the ABSENCE of server
    // state, so a mutation that never reached akka (renamed action, unregistered
    // role, rejected input) would satisfy them without testing anything. The
    // action is fire-and-forget, so acceptance is all that can be asserted here
    // - the rejection itself is asserted through the resulting state.
    expect(result.errors, 'the transfer mutation must be accepted by the server').toEqual([]);
  }

  // eslint-disable-next-line class-methods-use-this
  private async expectPrimaryMembership(page: PlaywrightPage, message: string, timeout: number): Promise<void> {
    await expect(async () => {
      const primary = (await getLiveKitMembershipRows(page)).find((row) => row.purpose === PRIMARY_PURPOSE);
      expect(primary?.hasToken, message).toBe(true);
    }).toPass({ timeout });
  }

  private async expectNoBreakoutListenRowStable(page: PlaywrightPage, timeout: number): Promise<void> {
    // Sample continuously across the window: an invalid target must never yield a
    // breakout-listen row at any point.
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const rows = await this.getBreakoutListenRows(page);
      expect(rows, 'no breakout-listen membership should be ghost-written for an invalid transfer target').toHaveLength(
        0,
      );
      await page.waitForTimeout(PROBE_SAMPLE_INTERVAL);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async expectPrimaryMembershipStable(page: PlaywrightPage, timeout: number): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const primary = (await getLiveKitMembershipRows(page)).find((row) => row.purpose === PRIMARY_PURPOSE);
      expect(primary?.hasToken, 'primary membership must survive a self-transfer').toBe(true);
      await page.waitForTimeout(PROBE_SAMPLE_INTERVAL);
    }
  }

  private async expectSingleActiveConvergence(
    targetMeetingId: string,
    targetShortName: string,
    timeout: number,
  ): Promise<void> {
    const start = Date.now();
    let converged = false;

    // Timestamped continuous sampling from the switch trigger until convergence,
    // asserting the single-active invariant on every observation.
    while (Date.now() - start < timeout) {
      const rows = await this.getBreakoutListenRows(this.modPage.page);
      const elapsed = Date.now() - start;
      expect(
        rows.length,
        `never two concurrent breakout-listen memberships (t=${elapsed}ms, saw ${rows.length})`,
      ).toBeLessThanOrEqual(1);
      if (rows.length === 1 && rows[0].roomName === targetMeetingId && rows[0].hasToken) {
        converged = true;
        break;
      }
      await this.modPage.page.waitForTimeout(PROBE_SAMPLE_INTERVAL);
    }

    expect(converged, `breakout-listen membership should converge to room "${targetShortName}"`).toBe(true);
  }

  // eslint-disable-next-line class-methods-use-this
  private async dismissAudioModalIfPresent(testPage: Page): Promise<void> {
    const modal = testPage.page.locator(e.audioModal);
    const modalVisible = await modal
      .waitFor({ state: 'visible', timeout: ELEMENT_WAIT_TIME })
      .then(() => true)
      .catch(() => false);
    if (modalVisible) {
      await testPage.waitAndClick(e.closeModal);
      await expect(modal, 'audio modal should close after the reload').toBeHidden({
        timeout: ELEMENT_WAIT_LONGER_TIME,
      });
    }
  }
}
