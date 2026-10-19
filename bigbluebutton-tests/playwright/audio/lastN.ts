import { expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { type ClientSettingsOverrides, Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { getRemoteAudioStates, type RemoteAudioState, type TestWindow } from './liveKitProbe';
import { connectMicrophone } from './util';

// Only the client reads the Last-N settings, so turning them on for the listener is enough.
export const lastNSettingsOverrides = (audibleSize: number, standbySize: number): ClientSettingsOverrides => ({
  public: {
    media: {
      livekit: {
        selectiveSubscription: {
          lastN: { enabled: true, audibleSize, standbySize },
        },
      },
    },
  },
});

// LiveKit sends 1 s of silence frames when a subscription is disabled; a
// 2 s window after the tiers settle only counts real media.
const PACKET_SAMPLE_WINDOW_MS = 2000;

interface TierSummary {
  subscribed: number;
  enabled: number;
}

interface SubscriptionChange {
  event: string;
  trackSid: string;
}

type ProbeWindow = TestWindow & { bbbLastNSubscriptionLog?: SubscriptionChange[] };

type EventedRoom = {
  on: (event: string, handler: (track: unknown, publication: { trackSid: string; source: string }) => void) => void;
  localParticipant: { identity: string };
};

const summarize = (states: RemoteAudioState[]): TierSummary => ({
  subscribed: states.reduce((sum, state) => sum + state.subscribed, 0),
  enabled: states.reduce((sum, state) => sum + state.enabled, 0),
});

const getLocalIdentity = (page: PlaywrightPage): Promise<string> =>
  page.evaluate(() => {
    const room = (window as TestWindow).liveKitRoom as unknown as EventedRoom | undefined;

    if (!room) throw new Error('window.liveKitRoom is not exposed');

    return room.localParticipant.identity;
  });

const startSubscriptionLog = (page: PlaywrightPage): Promise<void> =>
  page.evaluate(() => {
    const w = window as ProbeWindow;
    const room = w.liveKitRoom as unknown as EventedRoom | undefined;

    if (!room) throw new Error('window.liveKitRoom is not exposed');

    if (w.bbbLastNSubscriptionLog) {
      w.bbbLastNSubscriptionLog.length = 0;
      return;
    }

    w.bbbLastNSubscriptionLog = [];

    ['trackSubscribed', 'trackUnsubscribed'].forEach((event) => {
      room.on(event, (_track, publication) => {
        if (publication.source === 'microphone') {
          w.bbbLastNSubscriptionLog?.push({ event, trackSid: publication.trackSid });
        }
      });
    });
  });

const readSubscriptionLog = (page: PlaywrightPage): Promise<SubscriptionChange[]> =>
  page.evaluate(() => (window as ProbeWindow).bbbLastNSubscriptionLog ?? []);

// Remote identities whose microphone delivered new packets between two samples.
const receivingIdentities = async (page: PlaywrightPage, windowMs: number): Promise<string[]> => {
  const before = await getRemoteAudioStates(page);
  await page.waitForTimeout(windowMs);
  const after = await getRemoteAudioStates(page);

  return after
    .filter((state) => {
      const previous = before.find((candidate) => candidate.identity === state.identity);
      return state.packetsReceived > (previous?.packetsReceived ?? 0);
    })
    .map((state) => state.identity);
};

export class LastN extends MultiUsers {
  private speakersByIdentity = new Map<string, Page>();

  // A listener (moderator, muted mic) and two speakers with unmuted fake
  // microphones. The fake device plays a continuous tone, so both speakers
  // stay "talking" for the whole test.
  async initListenerAndSpeakers(testInfo: TestInfo, audibleSize: number, standbySize: number) {
    await this.context.addInitScript(() => {
      (window as TestWindow).BBB_EXPOSE_LIVEKIT_ROOM = true;
    });
    await this.initModPage(await this.context.newPage(), {
      testInfo,
      fullName: 'Listener',
      clientSettingsOverrides: lastNSettingsOverrides(audibleSize, standbySize),
    });
    await this.initUserPage(this.context, { testInfo, fullName: 'SpeakerA' });
    await this.initUserPage2(this.context, { testInfo, fullName: 'SpeakerB' });

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);

    for (const speaker of [this.userPage, this.userPage2]) {
      await speaker.waitAndClick(e.joinAudio);
      await connectMicrophone(speaker);
      await speaker.waitAndClick(e.unmuteMicButton);
      await speaker.hasElement(e.isTalking, 'the speaker should be talking after unmuting');
      this.speakersByIdentity.set(await getLocalIdentity(speaker.page), speaker);
    }

    await expect
      .poll(async () => (await getRemoteAudioStates(this.modPage.page)).filter((state) => state.unmuted > 0).length, {
        message: 'the listener should see both speakers publish an unmuted microphone',
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toBe(2);
  }

  async expectTiers(expected: TierSummary, message: string) {
    await expect
      .poll(async () => summarize(await getRemoteAudioStates(this.modPage.page)), {
        message,
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toEqual(expected);
  }

  // The tier bounds must hold over time, not only at one sample, and the
  // listener must receive media from exactly the audible speakers.
  async expectBoundedPlayback(audibleSize: number, standbySize: number) {
    await this.expectTiers(
      { subscribed: standbySize, enabled: audibleSize },
      `the listener should subscribe ${standbySize} and play ${audibleSize} of 2 talking microphones`,
    );

    for (let sample = 0; sample < 5; sample += 1) {
      const summary = summarize(await getRemoteAudioStates(this.modPage.page));
      expect(summary.subscribed, 'subscriptions should stay within the standby size').toBeLessThanOrEqual(standbySize);
      expect(summary.enabled, 'enabled microphones should stay within the audible size').toBeLessThanOrEqual(
        audibleSize,
      );
      await this.modPage.page.waitForTimeout(1000);
    }

    const receiving = await receivingIdentities(this.modPage.page, PACKET_SAMPLE_WINDOW_MS);
    expect(receiving, 'the listener should receive media only from the audible speaker').toHaveLength(audibleSize);
  }

  // With one audible slot and both speakers on standby, muting the audible
  // speaker must hand the slot to the other one by enabling its existing
  // subscription: no unsubscribe/resubscribe of the standby track.
  async expectSwitchWithoutResubscribe() {
    await this.expectTiers({ subscribed: 2, enabled: 1 }, 'the listener should hold 2 subscriptions and play 1');

    const states = await getRemoteAudioStates(this.modPage.page);
    const audible = states.find((state) => state.enabled > 0);
    const standby = states.find((state) => state.subscribed > 0 && state.enabled === 0);

    if (!audible || !standby) throw new Error('expected one audible and one standby microphone');

    const audibleSpeaker = this.speakersByIdentity.get(audible.identity);

    if (!audibleSpeaker) throw new Error(`no speaker page for ${audible.identity}`);

    await startSubscriptionLog(this.modPage.page);
    await audibleSpeaker.waitAndClick(e.muteMicButton);
    await audibleSpeaker.hasElement(e.unmuteMicButton, 'the audible speaker should be muted');

    await expect
      .poll(
        async () =>
          (await getRemoteAudioStates(this.modPage.page)).find((state) => state.identity === standby.identity)
            ?.enabled ?? 0,
        {
          message: 'the standby speaker should become audible once the audible speaker mutes',
          timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
        },
      )
      .toBe(1);

    const changes = await readSubscriptionLog(this.modPage.page);
    expect(
      changes.filter((change) => standby.trackSids.includes(change.trackSid)),
      'the standby track should be enabled in place, not resubscribed',
    ).toEqual([]);

    const receiving = await receivingIdentities(this.modPage.page, PACKET_SAMPLE_WINDOW_MS);
    expect(receiving, 'the listener should now receive the former standby speaker').toContain(standby.identity);
  }
}
