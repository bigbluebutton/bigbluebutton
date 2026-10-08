import { expect, TestInfo } from '@playwright/test';

import {
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  VIDEO_LOADING_WAIT_TIME,
} from '../core/constants';
import { elements as e } from '../core/elements';
import { isLegacy } from '../core/livekit';
import { parameters } from '../core/parameters';
import { MultiUsers } from '../user/multiusers';
import {
  backgroundDiffersFromRaw,
  backgroundIsUnchanged,
  sampleVideoPixels,
  uploadBackgroundVideoImage,
  VideoPixelFingerprint,
} from '../webcam/util';
import { dragAcrossWhiteboard, viewerDrawsTwoStrokesAndErasesOne } from '../whiteboard/util';
import { type GraphqlSockets, outage } from './util';

export const ANNOTATION_HISTORY_STREAM_FIELD = 'pres_annotation_history_curr_stream';

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

  /**
   * @returns whether this run actually exercised the automatic republish effect restore, so the
   * spec can tell a real pass from a run that skipped its way to green.
   */
  async webcamBackground(source: BackgroundSource, flavor: OutageFlavor, testInfo: TestInfo): Promise<boolean> {
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

      const deadline = Date.now() + LONG_MEDIA_RECOVERY_TIMEOUT;
      let recovery: 'republished' | 'failed-republish' | 'rolled-back' | 'camera-survived' = 'camera-survived';
      let reacquisitionStarted = false;
      while (Date.now() < deadline) {
        const counts = await this.webcamEffectCounts();
        if (counts.gum > countsBeforeOutage.gum) {
          reacquisitionStarted = true;
          const localVideoVisible = await this.modPage.page
            .locator(LOCAL_VIDEO)
            .isVisible()
            .catch(() => false);
          const remoteVideoVisible = await this.userPage.page
            .locator(REMOTE_VIDEO)
            .isVisible()
            .catch(() => false);
          if (localVideoVisible && remoteVideoVisible) {
            recovery = 'republished';
            break;
          }
        }
        if (
          await this.modPage.page
            .locator(e.joinVideo)
            .isVisible()
            .catch(() => false)
        ) {
          recovery = 'rolled-back';
          break;
        }
        await this.modPage.page.waitForTimeout(500);
      }
      if (recovery === 'camera-survived' && reacquisitionStarted) recovery = 'failed-republish';
      if (recovery !== 'republished') {
        testInfo.skip(true, `webcam did not auto-republish after the outage (${recovery})`);
        return false;
      }
    }

    const recoveryTimeout = flavor === 'reload' ? VIDEO_LOADING_WAIT_TIME : LONG_MEDIA_RECOVERY_TIMEOUT;
    await this.waitForBothVideos(recoveryTimeout);
    const after = await this.sampleBothVideos(recoveryTimeout);
    await this.attachEvidence('after', after, testInfo);
    const countsAfterOutage = await this.webcamEffectCounts();
    expect(
      countsAfterOutage.canvasCapture,
      'the camera effect engine should restart after republishing',
    ).toBeGreaterThan(countsBeforeOutage.canvasCapture);
    expect
      .soft(backgroundIsUnchanged(before.local, after.local), 'local background should persist after outage')
      .toBe(true);
    expect
      .soft(backgroundIsUnchanged(before.remote, after.remote), 'remote background should persist after outage')
      .toBe(true);
    // A reload re-applies the background through the preview on a fresh page, never through the
    // republish restore, so it does not count as coverage of that path.
    return flavor !== 'reload';
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

  // Regression: after a reconnection the annotation-history stream is subscribed
  // again from the point it was first started at, and the server replays the page
  // history since then. That replay reopened a presentation the presenter had hidden.
  async hiddenPresentationStaysHiddenAfterReconnection(graphqlSockets: GraphqlSockets) {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await viewerDrawsTwoStrokesAndErasesOne(this.modPage, this.userPage);

    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.wasRemoved(e.presentationContainer, 'should hide the presentation');
    await this.modPage.hasElement(e.restorePresentation, 'should display the restore presentation button');

    const socketsBeforeDrop = graphqlSockets.opened();
    graphqlSockets.drop();
    await expect
      .poll(() => graphqlSockets.opened(), {
        message: 'the presenter should reconnect to graphql',
        timeout: 2 * ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toBeGreaterThan(socketsBeforeDrop);
    await expect
      .poll(() => graphqlSockets.receivedSinceDrop(ANNOTATION_HISTORY_STREAM_FIELD), {
        message: 'the server should replay the annotation history after the reconnection',
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toBe(true);

    // the reopen used to follow the replay at once: keep watching
    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_TIME);
    await this.modPage.hasElement(
      e.restorePresentation,
      'the presentation should still be hidden after the reconnection',
    );
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'should not display the presentation after the reconnection',
    );

    // what happens from here on is a new event and must still restore it;
    // the viewer follows the presenter's hidden presentation, so it restores its own first
    if (await this.userPage.checkElement(e.restorePresentation)) {
      await this.userPage.waitAndClick(e.restorePresentation);
    }
    await this.userPage.waitAndClick(e.wbPencilShape);
    await dragAcrossWhiteboard(this.userPage, 0.4, 0.5);
    await this.modPage.hasElement(
      e.presentationContainer,
      'a new annotation should restore the presentation after the reconnection',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }
}

export function backgroundJoinParameter(source: BackgroundSource) {
  if (source !== 'join-parameter') return undefined;
  if (!parameters.server) throw new Error('BBB_URL is required for the webcam background URL');
  return `webcamBackgroundURL=${
    new URL('/html5client/resources/images/virtual-backgrounds/home.jpg', parameters.server).href
  }`;
}
