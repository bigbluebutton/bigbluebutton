import { type Browser, expect, type TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { isLiveKit } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { Audio } from './audio';
import {
  APOLLO_CLIENT_SETTINGS_MODULE,
  expectFloorHolder,
  getOwnUserId,
  getUserVoiceRows,
  isApolloClientExposed,
} from './floorProbe';
import { connectMicrophone } from './util';

const APOLLO_EXPOSURE_SKIP_REASON =
  'requires window.__APOLLO_CLIENT__ for the floor probe ' +
  '(dev bundle or enableApolloDevTools provisioned via clientSettingsOverride)';

// Moderator + attendee in one meeting, both with a connected (muted) microphone.
const initTwoSpeakers = async (browser: Browser, testInfo: TestInfo) => {
  const context = await browser.newContext();
  const audio = new Audio(browser, context);
  await audio.initModPage(await context.newPage(), { testInfo, createModules: APOLLO_CLIENT_SETTINGS_MODULE });
  await audio.initUserPage(context, { testInfo });
  const { modPage, userPage } = audio;
  test.skip(!(await isApolloClientExposed(modPage.page, ELEMENT_WAIT_TIME)), APOLLO_EXPOSURE_SKIP_REASON);
  await modPage.waitAndClick(e.joinAudio);
  await connectMicrophone(modPage);
  await userPage.waitAndClick(e.joinAudio);
  await connectMicrophone(userPage);
  const modUserId = await getOwnUserId(modPage.page);
  const attendeeUserId = await getOwnUserId(userPage.page);
  return { modPage, userPage, modUserId, attendeeUserId };
};

// akka-apps floor control (voiceConf.floorControl) synthesizes floor grants from
// client-reported talking state on the LiveKit bridge. These tests observe the
// user_voice.floor GQL states through the floorProbe helpers.
test.describe('Audio floor control', { tag: ['@ci', '@media'] }, () => {
  test('floor state is isolated between concurrent meetings', async ({ browser }, testInfo) => {
    test.skip(!isLiveKit, 'akka-apps floor control is specific to the LiveKit audio bridge');

    // Meeting A: moderator + attendee; meeting B: a single moderator.
    const {
      modPage: modA,
      userPage: attendeeA,
      modUserId: modAUserId,
      attendeeUserId: attendeeAUserId,
    } = await initTwoSpeakers(browser, testInfo);
    const contextB = await browser.newContext();
    const audioB = new Audio(browser, contextB);
    await audioB.initModPage(await contextB.newPage(), {
      testInfo,
      fullName: 'ModeratorB',
      createModules: APOLLO_CLIENT_SETTINGS_MODULE,
    });
    test.skip(!(await isApolloClientExposed(audioB.modPage.page, ELEMENT_WAIT_TIME)), APOLLO_EXPOSURE_SKIP_REASON);
    const modB = audioB.modPage;

    await modB.waitAndClick(e.joinAudio);
    await connectMicrophone(modB);
    const modBUserId = await getOwnUserId(modB.page);

    // A's speaker takes A's floor.
    await modA.waitAndClick(e.unmuteMicButton);
    await modA.hasElement(e.isTalking, 'moderator A should be talking');
    await expectFloorHolder(
      modA.page,
      modAUserId,
      'meeting A floor should go to its own speaker',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // B's speaker takes B's floor; meeting A must be unaffected.
    await modB.waitAndClick(e.unmuteMicButton);
    await modB.hasElement(e.isTalking, 'moderator B should be talking');
    await expectFloorHolder(
      modB.page,
      modBUserId,
      'meeting B floor should go to its own speaker',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await expectFloorHolder(
      modA.page,
      modAUserId,
      'meeting A floor should be unaffected by meeting B activity',
      ELEMENT_WAIT_TIME,
    );

    // The floor switches within meeting A: the previous holder must be released
    // even though another meeting granted a floor in between.
    await modA.waitAndClick(e.muteMicButton);
    await attendeeA.waitAndClick(e.unmuteMicButton);
    await attendeeA.hasElement(e.isTalking, 'attendee A should be talking');
    await expectFloorHolder(
      attendeeA.page,
      attendeeAUserId,
      'meeting A floor should switch to the next speaker, releasing the previous holder',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await expectFloorHolder(
      modB.page,
      modBUserId,
      'meeting B floor should survive meeting A floor switches',
      ELEMENT_WAIT_TIME,
    );
  });

  test('a continuously talking speaker is not starved of the floor', async ({ browser }, testInfo) => {
    test.skip(!isLiveKit, 'akka-apps floor control is specific to the LiveKit audio bridge');
    const { modPage, userPage, modUserId, attendeeUserId } = await initTwoSpeakers(browser, testInfo);

    // Near-simultaneous unmute so floor grants land on the same cooldown window
    await Promise.all([modPage.waitAndClick(e.unmuteMicButton), userPage.waitAndClick(e.unmuteMicButton)]);
    await expect(async () => {
      const rows = await getUserVoiceRows(modPage.page);
      expect(rows.filter((row) => row.talking).length, 'both speakers should be talking').toBe(2);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // Both keep talking: the later floor grant lands inside the earlier grant's
    // cooldown window and must be retried instead of dropped, so each speaker
    // is granted the floor at some point (lastFloorTime set for both).
    await expect(async () => {
      const rows = await getUserVoiceRows(modPage.page);
      const granted = rows
        .filter((row) => row.lastFloorTime !== '0')
        .map((row) => row.userId)
        .sort();
      expect(granted, 'both speakers should have held the floor').toEqual([modUserId, attendeeUserId].sort());
    }).toPass({ timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
  });

  test('the next active speaker is promoted when the floor holder leaves', async ({ browser }, testInfo) => {
    test.skip(!isLiveKit, 'akka-apps floor control is specific to the LiveKit audio bridge');
    const { modPage, userPage, modUserId, attendeeUserId } = await initTwoSpeakers(browser, testInfo);

    await modPage.waitAndClick(e.unmuteMicButton);
    await modPage.hasElement(e.isTalking, 'moderator should be talking');
    await expectFloorHolder(
      modPage.page,
      modUserId,
      'the first speaker should take the floor',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // The attendee starts talking, the holder then leaves within the pending window.
    await userPage.waitAndClick(e.unmuteMicButton);
    await expect(async () => {
      const rows = await getUserVoiceRows(userPage.page);
      expect(
        rows.some((row) => row.userId === attendeeUserId && row.talking),
        'the attendee should be talking server-side',
      ).toBeTruthy();
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await modPage.waitAndClick(e.leaveMeetingDropdown);
    await modPage.waitAndClick(e.directLogoutButton);
    await modPage.hasElement(e.meetingEndedModal, 'the holder should have left the meeting');

    await expectFloorHolder(
      userPage.page,
      attendeeUserId,
      'the floor should be promoted to the remaining active speaker',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
  });
});
