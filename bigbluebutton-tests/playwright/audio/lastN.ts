import { type BrowserContext, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
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

type TalkWindow = Window & { bbbTestTalk?: (on: boolean) => void };

interface SpeakerSetup {
  // Microphones that sound only while the test makes the speaker talk.
  switchableMicrophones?: boolean;
  // SpeakerB stays muted after joining audio.
  secondSpeakerMuted?: boolean;
}

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

// The fake capture device never pauses, so speech could not start or stop.
// This microphone is a WebAudio buzz that sounds only after bbbTestTalk(true).
const installSwitchableMicrophones = (context: BrowserContext): Promise<void> =>
  context.addInitScript(() => {
    let audioContext: AudioContext | undefined;
    let gain: GainNode | undefined;
    let destination: MediaStreamAudioDestinationNode | undefined;

    const ensureSource = () => {
      if (!audioContext || !gain || !destination) {
        audioContext = new AudioContext();
        const low = audioContext.createOscillator();
        const high = audioContext.createOscillator();
        low.type = 'sawtooth';
        low.frequency.value = 180;
        high.type = 'square';
        high.frequency.value = 610;
        gain = audioContext.createGain();
        gain.gain.value = 0;
        destination = audioContext.createMediaStreamDestination();
        low.connect(gain);
        high.connect(gain);
        gain.connect(destination);
        low.start();
        high.start();
      }

      return { audioContext, gain, destination };
    };

    (window as TalkWindow).bbbTestTalk = (on: boolean) => {
      const source = ensureSource();
      source.audioContext.resume();
      source.gain.gain.setValueAtTime(on ? 0.45 : 0, source.audioContext.currentTime);
    };

    const { mediaDevices } = navigator;
    const getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    mediaDevices.getUserMedia = async (constraints?: MediaStreamConstraints) => {
      if (!constraints?.audio) return getUserMedia(constraints);

      const stream = new MediaStream([ensureSource().destination.stream.getAudioTracks()[0].clone()]);

      if (constraints.video) {
        (await getUserMedia({ video: constraints.video })).getVideoTracks().forEach((track) => stream.addTrack(track));
      }

      return stream;
    };
  });

// Starts or stops speech on a switchable microphone, until LiveKit reports the
// change to the speaker's own client. The talking indicator would not do: it
// lists every participant who is talking.
const talk = async (speaker: Page, on = true): Promise<void> => {
  await speaker.page.evaluate((talking) => (window as TalkWindow).bbbTestTalk?.(talking), on);
  await expect
    .poll(() => speaker.page.evaluate(() => (window as TestWindow).liveKitRoom?.localParticipant.isSpeaking ?? false), {
      message: `LiveKit should detect the speaker ${on ? 'talking' : 'silent'}`,
      timeout: ELEMENT_WAIT_TIME,
    })
    .toBe(on);
};

// Whether the page's LiveKit room reports a remote participant as speaking.
// Only LiveKit speaker updates set this; BBB voice activity does not.
const isReportedSpeaking = (page: PlaywrightPage, identity: string): Promise<boolean> =>
  page.evaluate((id) => (window as TestWindow).liveKitRoom?.remoteParticipants.get(id)?.isSpeaking ?? false, identity);

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

  // A listener (moderator, muted mic) and two speakers with unmuted
  // microphones. The fake device loops a speech recording with no pauses, so
  // both speakers stay "talking" for the whole test; switchable microphones
  // stay silent until the test makes a speaker talk.
  async initListenerAndSpeakers(
    testInfo: TestInfo,
    audibleSize: number,
    standbySize: number,
    { switchableMicrophones = false, secondSpeakerMuted = false }: SpeakerSetup = {},
  ) {
    await this.context.addInitScript(() => {
      (window as TestWindow).BBB_EXPOSE_LIVEKIT_ROOM = true;
    });
    if (switchableMicrophones) await installSwitchableMicrophones(this.context);
    await this.initModPage(await this.context.newPage(), {
      testInfo,
      fullName: 'Listener',
      clientSettingsOverrides: lastNSettingsOverrides(audibleSize, standbySize),
    });
    await this.initUserPage(this.context, { testInfo, fullName: 'SpeakerA' });
    await this.initUserPage2(this.context, { testInfo, fullName: 'SpeakerB' });

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);

    const unmutedSpeakers = secondSpeakerMuted ? [this.userPage] : [this.userPage, this.userPage2];

    for (const speaker of [this.userPage, this.userPage2]) {
      await speaker.waitAndClick(e.joinAudio);
      await connectMicrophone(speaker);
      if (unmutedSpeakers.includes(speaker)) {
        await speaker.waitAndClick(e.unmuteMicButton);
        if (!switchableMicrophones) {
          await speaker.hasElement(e.isTalking, 'the speaker should be talking after unmuting');
        }
      }
      this.speakersByIdentity.set(await getLocalIdentity(speaker.page), speaker);
    }

    await expect
      .poll(async () => (await getRemoteAudioStates(this.modPage.page)).filter((state) => state.unmuted > 0).length, {
        message: 'the listener should see each unmuted speaker publish an unmuted microphone',
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toBe(unmutedSpeakers.length);
  }

  private speakerFor(identity: string): Page {
    const speaker = this.speakersByIdentity.get(identity);

    if (!speaker) throw new Error(`no speaker page for ${identity}`);

    return speaker;
  }

  private async enabledCount(identity: string): Promise<number> {
    return (await getRemoteAudioStates(this.modPage.page)).find((state) => state.identity === identity)?.enabled ?? 0;
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

  // Both speakers are silent and on standby, one of them audible. The audible
  // one starts talking and keeps the slot, so the other stays disabled when it
  // starts talking too: LiveKit must still report it speaking, since fast
  // standby switching depends on those updates and BBB voice activity cannot
  // set them. When the first one stops, the other must take the slot by
  // enabling its existing subscription.
  async expectSpeechSwitchWithoutResubscribe() {
    await this.expectTiers({ subscribed: 2, enabled: 1 }, 'the listener should hold 2 subscriptions and play 1');

    const states = await getRemoteAudioStates(this.modPage.page);
    const audible = states.find((state) => state.enabled > 0);
    const standby = states.find((state) => state.subscribed > 0 && state.enabled === 0);

    if (!audible || !standby) throw new Error('expected one audible and one standby microphone');

    const audibleSpeaker = this.speakerFor(audible.identity);

    await startSubscriptionLog(this.modPage.page);
    await talk(audibleSpeaker);
    await expect
      .poll(() => isReportedSpeaking(this.modPage.page, audible.identity), {
        message: 'the listener should see the audible speaker talking before the standby one starts',
        timeout: ELEMENT_WAIT_TIME,
      })
      .toBe(true);
    await talk(this.speakerFor(standby.identity));
    await this.expectReportedSpeakingWhileDisabled(standby.identity);

    await talk(audibleSpeaker, false);
    await expect
      .poll(() => this.enabledCount(standby.identity), {
        message: 'the standby speaker should take the slot once the audible speaker stops',
        timeout: ELEMENT_WAIT_TIME,
      })
      .toBe(1);
    await this.expectTiers({ subscribed: 2, enabled: 1 }, 'the silent speaker should go back to standby');

    const changes = await readSubscriptionLog(this.modPage.page);
    expect(
      changes.filter((change) => standby.trackSids.includes(change.trackSid)),
      'the standby track should be enabled in place, not resubscribed',
    ).toEqual([]);
  }

  async expectReportedSpeakingWhileDisabled(identity: string) {
    await expect
      .poll(
        async () => {
          const state = (await getRemoteAudioStates(this.modPage.page)).find(
            (candidate) => candidate.identity === identity,
          );

          return {
            speaking: await isReportedSpeaking(this.modPage.page, identity),
            subscribed: state?.subscribed ?? 0,
            enabled: state?.enabled ?? 0,
          };
        },
        {
          message: 'LiveKit should report the standby speaker speaking while its track is disabled',
          timeout: ELEMENT_WAIT_TIME,
        },
      )
      .toEqual({ speaking: true, subscribed: 1, enabled: 0 });
  }

  // SpeakerA is unmuted, silent and audible; SpeakerB is muted. An unmute is
  // the first sign that SpeakerB is about to talk, so it alone must give them
  // the slot, before any speech on their microphone.
  async expectUnmuteTakesAudibleSlot() {
    const silentSpeaker = this.userPage;
    const unmutingSpeaker = this.userPage2;
    const silentIdentity = await getLocalIdentity(silentSpeaker.page);
    const unmutingIdentity = await getLocalIdentity(unmutingSpeaker.page);

    await expect
      .poll(() => this.enabledCount(silentIdentity), {
        message: 'the only unmuted speaker should be audible',
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toBe(1);

    await unmutingSpeaker.waitAndClick(e.unmuteMicButton);
    await unmutingSpeaker.hasElement(e.muteMicButton, 'the second speaker should be unmuted');

    await expect
      .poll(() => this.enabledCount(unmutingIdentity), {
        message: 'the speaker who unmutes should become audible before talking',
        timeout: ELEMENT_WAIT_TIME,
      })
      .toBe(1);
    expect(await this.enabledCount(silentIdentity), 'the silent speaker should give up the only slot').toBe(0);
    expect(await unmutingSpeaker.checkElement(e.isTalking), 'the second speaker should not have talked').toBe(false);
  }
}
