import { expect, TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_TIME, VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { isLegacy } from '../core/livekit';
import { Page } from '../core/page';
import { parameters } from '../core/parameters';
import { MultiUsers } from '../user/multiusers';
import {
  backgroundDiffersFromRaw,
  backgroundIsUnchanged,
  sampleVideoPixels,
  uploadBackgroundVideoImage,
  VideoPixelFingerprint,
} from '../webcam/util';
import { outage } from './util';

export type BackgroundSource = 'built-in' | 'custom' | 'join-parameter';
export type OutageFlavor = 'signaling' | 'short-media' | 'long-media' | 'reload';

const RESTORING_MEDIA_TOAST =
  '//div[@data-test="toastSmallMsg"]/span[contains(text(), "Connection issue detected. Restoring your audio and video...")]';
const UNABLE_TO_CONNECT_TOAST =
  '//div[@data-test="toastSmallMsg"]/span[contains(text(), "Unable to connect") and contains(text(), "code 3002")]';
const LOCAL_VIDEO = e.currentUserLocalStreamVideo;
const REMOTE_VIDEO = `${e.webcamVideoItem} video:not([data-local-stream="true"])`;
const OUTAGE_SECONDS: Record<Exclude<OutageFlavor, 'reload'>, number> = {
  signaling: 12,
  'short-media': 8,
  'long-media': 35,
};
// A 35s media outage can require the client's full reconnect cycle before webcam controls return.
const LONG_MEDIA_RECOVERY_TIMEOUT = 60000;
const LEGACY_RECONNECTION_TIMEOUT = 60000;

export class Reconnection extends MultiUsers {
  private async installWebcamEffectCounters() {
    await this.modPage.page.evaluate(() => {
      const tracedWindow = window as typeof window & {
        reconnectionGumCount?: number;
        reconnectionCanvasCaptureCount?: number;
      };
      const { mediaDevices } = navigator;
      const getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
      tracedWindow.reconnectionGumCount = 0;
      tracedWindow.reconnectionCanvasCaptureCount = 0;
      mediaDevices.getUserMedia = async (constraints) => {
        const stream = await getUserMedia(constraints);
        if (constraints?.video) tracedWindow.reconnectionGumCount = (tracedWindow.reconnectionGumCount || 0) + 1;
        return stream;
      };
      const { captureStream } = HTMLCanvasElement.prototype;
      HTMLCanvasElement.prototype.captureStream = function captureStreamWithCount(...args) {
        tracedWindow.reconnectionCanvasCaptureCount = (tracedWindow.reconnectionCanvasCaptureCount || 0) + 1;
        return captureStream.apply(this, args);
      };
    });
  }

  private async webcamEffectCounts() {
    return this.modPage.page.evaluate(() => {
      const tracedWindow = window as typeof window & {
        reconnectionGumCount?: number;
        reconnectionCanvasCaptureCount?: number;
      };
      return {
        gum: tracedWindow.reconnectionGumCount || 0,
        canvasCapture: tracedWindow.reconnectionCanvasCaptureCount || 0,
      };
    });
  }

  // Counts the frames the subscriber has actually decoded, straight from the
  // peer connection's inbound-rtp stats. The pixel fingerprints prove the
  // background is right; this proves media is flowing again at all.
  private async decodedFrames() {
    return this.userPage.page.evaluate(async () => {
      const peers =
        (window as typeof window & { reconnectionPeerConnections?: RTCPeerConnection[] }).reconnectionPeerConnections ||
        [];
      const sum = (total: number, value: number) => total + value;
      const perPeer = await Promise.all(
        peers.map(async (peer) => {
          const stats = await peer.getStats();
          const frames: number[] = [];
          stats.forEach((report) => {
            if (report.type !== 'inbound-rtp' || report.kind !== 'video') return;
            const { framesDecoded } = report as RTCInboundRtpStreamStats & { framesDecoded?: number };
            frames.push(framesDecoded ?? 0);
          });
          return frames.reduce(sum, 0);
        }),
      );
      return perPeer.reduce(sum, 0);
    });
  }

  async webcamMedia() {
    await this.modPage.shareWebcam();
    await this.userPage.waitForSelector(REMOTE_VIDEO);
    const before = await this.decodedFrames();
    await outage(OUTAGE_SECONDS['short-media'], { media: true });
    await expect
      .poll(() => this.decodedFrames(), {
        message: 'subscriber inbound video frames should advance after automatic camera republish',
        timeout: LONG_MEDIA_RECOVERY_TIMEOUT,
      })
      .toBeGreaterThan(before);
  }

  async chat() {
    await this.modPage.waitForSelector(e.chatBox);
    const chatBoxLocator = this.modPage.page.locator(e.chatBox);
    await expect(chatBoxLocator, 'chat should be enabled after joining').toBeEnabled();
    await outage(30, {
      duringOutage: async () => {
        // bbb-webrtc-sfu does not emit the LiveKit media-recovery toasts; its disabled chat is the outage signal.
        if (!isLegacy) {
          await this.modPage.hasElement(
            RESTORING_MEDIA_TOAST,
            'should show the 4.0 connection recovery toast',
            ELEMENT_WAIT_EXTRA_LONG_TIME,
          );
        }
        await expect(chatBoxLocator, 'chat should be disabled during the outage').toBeDisabled({
          timeout: ELEMENT_WAIT_TIME,
        });
        if (!isLegacy) {
          await this.modPage.hasElement(
            UNABLE_TO_CONNECT_TOAST,
            'should show the 4.0 code 3002 toast',
            ELEMENT_WAIT_EXTRA_LONG_TIME,
          );
        }
      },
    });
    await expect(chatBoxLocator, 'chat should be enabled after reconnecting').toBeEnabled({
      timeout: isLegacy ? LEGACY_RECONNECTION_TIMEOUT : ELEMENT_WAIT_EXTRA_LONG_TIME,
    });
  }

  async microphone() {
    await this.modPage.page.evaluate(() => {
      const { mediaDevices } = navigator;
      const getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
      (window as typeof window & { reconnectionAudioTracks?: MediaStreamTrack[] }).reconnectionAudioTracks = [];
      mediaDevices.getUserMedia = async (constraints) => {
        const stream = await getUserMedia(constraints);
        if (constraints?.audio) {
          (window as typeof window & { reconnectionAudioTracks: MediaStreamTrack[] }).reconnectionAudioTracks.push(
            ...stream.getAudioTracks(),
          );
        }
        return stream;
      };
    });
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();
    const muteMicButtonLocator = this.modPage.page.locator(e.muteMicButton);
    await expect(muteMicButtonLocator, 'mute should be enabled after joining audio').toBeEnabled();
    await outage(30, {
      duringOutage: async () => {
        // bbb-webrtc-sfu has no equivalent user-visible reconnection toast; recovery is asserted below.
        if (!isLegacy) {
          await this.modPage.hasElement(
            RESTORING_MEDIA_TOAST,
            'should show the 4.0 connection recovery toast',
            ELEMENT_WAIT_EXTRA_LONG_TIME,
          );
          await this.modPage.hasElement(
            UNABLE_TO_CONNECT_TOAST,
            'should show the 4.0 code 3002 toast',
            ELEMENT_WAIT_EXTRA_LONG_TIME,
          );
        }
      },
    });
    await expect(muteMicButtonLocator, 'mute should be enabled after reconnecting').toBeEnabled({
      timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
    });
    await expect
      .poll(
        () =>
          this.modPage.page.evaluate(() => {
            const { reconnectionAudioTracks: tracks } = window as typeof window & {
              reconnectionAudioTracks?: MediaStreamTrack[];
            };
            return tracks?.some((track) => track.kind === 'audio' && track.readyState === 'live' && track.enabled);
          }),
        {
          message: 'the microphone capture track should remain live and enabled after reconnection',
          timeout: isLegacy ? LEGACY_RECONNECTION_TIMEOUT : ELEMENT_WAIT_TIME,
        },
      )
      .toBe(true);
  }

  async webcamBackground(source: BackgroundSource, flavor: OutageFlavor, testInfo: TestInfo) {
    await this.installWebcamEffectCounters();
    const rawPreview = await this.selectBackground(source);
    await this.modPage.waitAndClick(e.startSharingWebcam);
    await this.waitForBothVideos();
    const before = await this.sampleBothVideos();
    await this.attachEvidence('before', { rawPreview, ...before }, testInfo);
    expect(
      backgroundDiffersFromRaw(rawPreview, rawPreview),
      'control probe: an unapplied background must fail the pre-outage precondition',
    ).toBe(false);
    expect
      .soft(backgroundDiffersFromRaw(rawPreview, before.local), 'local background should be visibly applied')
      .toBe(true);
    expect
      .soft(backgroundDiffersFromRaw(rawPreview, before.remote), 'remote background should be visibly applied')
      .toBe(true);
    const countsBeforeOutage = await this.webcamEffectCounts();

    if (flavor === 'reload') {
      await this.modPage.page.reload();
      await this.modPage.waitForSelector(e.joinVideo, ELEMENT_WAIT_EXTRA_LONG_TIME);
      if (await this.modPage.checkElement(e.closeModal)) await this.modPage.waitAndClick(e.closeModal);
      await this.modPage.shareWebcam();
    } else {
      const media = flavor !== 'signaling';
      const seconds = OUTAGE_SECONDS[flavor];
      await outage(seconds, { media });

      // The capture track now survives a republish, so there is no fresh
      // getUserMedia to wait for: recovery is observed on the video elements
      // themselves, on both ends of the call.
      await this.waitForBothVideos(LONG_MEDIA_RECOVERY_TIMEOUT);
      await waitForVideoToAdvance(this.modPage, LOCAL_VIDEO, 'local');
      await waitForVideoToAdvance(this.userPage, REMOTE_VIDEO, 'remote');
    }

    const recoveryTimeout = flavor === 'reload' ? VIDEO_LOADING_WAIT_TIME : LONG_MEDIA_RECOVERY_TIMEOUT;
    await this.waitForBothVideos(recoveryTimeout);
    const after = await this.sampleBothVideos(recoveryTimeout);
    await this.attachEvidence('after', after, testInfo);
    const countsAfterOutage = await this.webcamEffectCounts();
    if (flavor !== 'reload') {
      // These two numbers are what separates "preserved" from "re-acquired": a
      // republish that reuses the live stream neither re-prompts the camera nor
      // restarts the effect pipeline. Reloading the page legitimately does both.
      expect(countsAfterOutage.gum, 'the camera track should be preserved across the republish, not re-acquired').toBe(
        countsBeforeOutage.gum,
      );
      expect(
        countsAfterOutage.canvasCapture,
        'the camera effect pipeline should be preserved across the republish, not restarted',
      ).toBe(countsBeforeOutage.canvasCapture);
    }
    expect
      .soft(backgroundIsUnchanged(before.local, after.local), 'local background should persist after outage')
      .toBe(true);
    expect
      .soft(backgroundIsUnchanged(before.remote, after.remote), 'remote background should persist after outage')
      .toBe(true);
  }

  private async selectBackground(source: BackgroundSource) {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.waitAndClick(e.backgroundSettingsTitle);
    await this.modPage.waitForSelector(e.noneBackgroundButton);
    await this.modPage.waitAndClick(e.noneBackgroundButton);
    const rawPreview = await sampleVideoPixels(this.modPage, e.webcamMirroredVideoPreview);
    if (source === 'built-in') {
      await this.modPage.waitAndClick(`${e.selectDefaultBackground}[aria-label="Home"]`);
    } else if (source === 'custom') {
      await uploadBackgroundVideoImage(this.modPage);
      await this.modPage.waitAndClick(e.selectCustomBackground);
    } else {
      const joinParameterBackground = this.modPage.page.locator(e.selectCustomBackground);
      await expect(joinParameterBackground).toHaveCSS('background-image', /url\("blob:https?:\/\//, {
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      });
      await joinParameterBackground.click();
      await expect(joinParameterBackground, 'the join-parameter background should be selected').toHaveAttribute(
        'aria-pressed',
        'true',
      );
    }
    return rawPreview;
  }

  private async waitForBothVideos(timeout = VIDEO_LOADING_WAIT_TIME) {
    await this.modPage.waitForSelector(LOCAL_VIDEO, timeout);
    await this.userPage.waitForSelector(REMOTE_VIDEO, timeout);
    await this.modPage.wasRemoved(e.webcamConnecting, 'local webcam should finish connecting', timeout);
  }

  private async sampleBothVideos(timeout?: number) {
    return {
      local: await sampleVideoPixels(this.modPage, LOCAL_VIDEO, timeout),
      remote: await sampleVideoPixels(this.userPage, REMOTE_VIDEO, timeout),
    };
  }

  private async attachEvidence(
    phase: string,
    fingerprints: { rawPreview?: VideoPixelFingerprint; local: VideoPixelFingerprint; remote: VideoPixelFingerprint },
    testInfo: TestInfo,
  ) {
    await testInfo.attach(`${phase}-fingerprints`, {
      body: JSON.stringify(fingerprints, null, 2),
      contentType: 'application/json',
    });
    await testInfo.attach(`${phase}-local`, { body: await this.modPage.page.screenshot(), contentType: 'image/png' });
    await testInfo.attach(`${phase}-remote`, { body: await this.userPage.page.screenshot(), contentType: 'image/png' });
  }
}

// A video element can stay attached with a decodable last frame while its media has
// stopped flowing, so "visible" is not enough to call a reconnect recovered. An
// advancing currentTime is, and it is the same liveness signal
// webcam/util.ts:webcamContentCheck already relies on.
async function waitForVideoToAdvance(testPage: Page, selector: string, label: string) {
  const readCurrentTime = () =>
    testPage.page
      .locator(selector)
      .first()
      .evaluate((element: HTMLVideoElement) => element.currentTime);
  const startTime = await readCurrentTime();
  await expect
    .poll(readCurrentTime, {
      message: `the ${label} video should resume playing after the outage`,
      timeout: LONG_MEDIA_RECOVERY_TIMEOUT,
    })
    .toBeGreaterThan(startTime);
}

export function backgroundJoinParameter(source: BackgroundSource) {
  if (source !== 'join-parameter') return undefined;
  if (!parameters.server) throw new Error('BBB_URL is required for the webcam background URL');
  return `webcamBackgroundURL=${
    new URL('/html5client/resources/images/virtual-backgrounds/home.jpg', parameters.server).href
  }`;
}
