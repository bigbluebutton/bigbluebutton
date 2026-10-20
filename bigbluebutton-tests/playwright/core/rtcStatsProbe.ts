import { type BrowserContext, expect, type Page as PlaywrightPage, test } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from './constants';

// Reads what a page actually receives over WebRTC, whichever media bridge carries it.
// LiveKit and bbb-webrtc-sfu both use plain RTCPeerConnections, so the page's
// connections are recorded as they are created and their inbound-rtp statistics are
// read directly (audio/liveKitProbe.ts reads the LiveKit room instead, LiveKit only).

// Passed into page.evaluate rather than closed over: those callbacks are
// serialized and run in the browser, where this module's scope does not exist.
const NOT_TRACKED_ERR_MSG = 'peer connections are not tracked - call trackPeerConnections before the page loads';

const VIDEO_SAMPLE_WINDOW = 2000;
const AUDIO_SAMPLE_WINDOW = 3000;
// The fake speech decodes to an energy of about 0.04 per 3 s on either bridge, silence
// to less than 0.0002. Packets alone prove little: the legacy bridge keeps sending the
// conference mix while everyone is muted.
const MIN_SPEECH_ENERGY = 0.005;

type TrackedWindow = Window & {
  RTCPeerConnection: typeof RTCPeerConnection;
  bbbTestPeerConnections?: RTCPeerConnection[];
};

// Must run before navigation. Applies to every page of the context, which covers
// the users the MultiUsers helpers open in it later.
export const trackPeerConnections = (context: BrowserContext): Promise<void> =>
  context.addInitScript(() => {
    const w = window as TrackedWindow;
    const NativePeerConnection = w.RTCPeerConnection;

    if (!NativePeerConnection || w.bbbTestPeerConnections) return;

    const tracked: RTCPeerConnection[] = [];
    w.bbbTestPeerConnections = tracked;

    class TrackedPeerConnection extends NativePeerConnection {
      constructor(configuration?: RTCConfiguration) {
        super(configuration);
        tracked.push(this);
      }
    }

    w.RTCPeerConnection = TrackedPeerConnection;
  });

// Counter increases over the measuring window.
export interface InboundRtpDelta {
  // inbound-rtp streams present at both ends of the window
  streams: number;
  packetsReceived: number;
  bytesReceived: number;
  // video only
  framesDecoded: number;
  // audio only: the integral of the squared level of the decoded audio
  totalAudioEnergy: number;
}

export interface VideoReception extends InboundRtpDelta {
  found: boolean;
  videoWidth: number;
  videoHeight: number;
  currentTimeAdvance: number;
}

interface ProbeOptions {
  kind: 'audio' | 'video';
  windowMs: number;
  videoSelector?: string;
  notTracked: string;
}

const probe = (page: PlaywrightPage, options: Omit<ProbeOptions, 'notTracked'>): Promise<VideoReception> =>
  page.evaluate(
    async ({ kind, windowMs, videoSelector, notTracked }: ProbeOptions) => {
      const connections = (window as TrackedWindow).bbbTestPeerConnections;

      if (!connections) throw new Error(notTracked);

      const video = videoSelector ? document.querySelector<HTMLVideoElement>(videoSelector) : null;
      // With a video element, only the stream that feeds it counts.
      const trackId = video?.srcObject instanceof MediaStream ? video.srcObject.getVideoTracks()[0]?.id : undefined;

      type Counters = Omit<InboundRtpDelta, 'streams'>;

      // Keyed per connection and stream, so a connection created or closed during the
      // window only counts the streams it has at both ends.
      const sample = async () => {
        const streams = new Map<string, Counters>();

        await Promise.all(
          connections.map(async (pc, index) => {
            if (pc.connectionState === 'closed') return;

            const stats = await pc.getStats().catch(() => undefined);

            stats?.forEach((report) => {
              if (report.type !== 'inbound-rtp' || report.kind !== kind) return;
              if (videoSelector && report.trackIdentifier !== trackId) return;

              streams.set(`${index}/${report.id}`, {
                packetsReceived: report.packetsReceived ?? 0,
                bytesReceived: report.bytesReceived ?? 0,
                framesDecoded: report.framesDecoded ?? 0,
                totalAudioEnergy: report.totalAudioEnergy ?? 0,
              });
            });
          }),
        );

        return streams;
      };

      const startTime = video?.currentTime ?? 0;
      const before = await sample();
      await new Promise((resolve) => {
        setTimeout(resolve, windowMs);
      });
      const after = await sample();

      const result: VideoReception = {
        found: !!video,
        videoWidth: video?.videoWidth ?? 0,
        videoHeight: video?.videoHeight ?? 0,
        currentTimeAdvance: (video?.currentTime ?? 0) - startTime,
        streams: 0,
        packetsReceived: 0,
        bytesReceived: 0,
        framesDecoded: 0,
        totalAudioEnergy: 0,
      };

      after.forEach((end, key) => {
        const start = before.get(key);

        if (!start) return;

        result.streams += 1;
        result.packetsReceived += end.packetsReceived - start.packetsReceived;
        result.bytesReceived += end.bytesReceived - start.bytesReceived;
        result.framesDecoded += end.framesDecoded - start.framesDecoded;
        result.totalAudioEnergy += end.totalAudioEnergy - start.totalAudioEnergy;
      });

      return result;
    },
    { ...options, notTracked: NOT_TRACKED_ERR_MSG },
  );

// What arrived over windowMs, summed over every inbound stream of that kind.
export const measureInboundRtp = async (
  page: PlaywrightPage,
  kind: 'audio' | 'video',
  windowMs: number,
): Promise<InboundRtpDelta> => {
  const { streams, packetsReceived, bytesReceived, framesDecoded, totalAudioEnergy } = await probe(page, {
    kind,
    windowMs,
  });

  return { streams, packetsReceived, bytesReceived, framesDecoded, totalAudioEnergy };
};

// Playback of one video element over windowMs, with the inbound stream that feeds it.
export const measureVideoReception = (
  page: PlaywrightPage,
  videoSelector: string,
  windowMs: number,
): Promise<VideoReception> => probe(page, { kind: 'video', windowMs, videoSelector });

// Records in the report the values an assertion passed on.
const annotate = (type: string, values: object) =>
  test.info().annotations.push({ type, description: JSON.stringify(values) });

// The element plays, and new frames of its inbound stream are being decoded. Retried
// while the subscription settles.
export const expectVideoReceived = async (
  page: PlaywrightPage,
  videoSelector: string,
  description: string,
): Promise<void> => {
  await expect(async () => {
    const reception = await measureVideoReception(page, videoSelector, VIDEO_SAMPLE_WINDOW);
    const detail = JSON.stringify(reception);
    expect(reception.found, `${description}: no ${videoSelector} element`).toBe(true);
    expect(reception.videoWidth, `${description}: the video should have a decoded size (${detail})`).toBeGreaterThan(0);
    expect(reception.currentTimeAdvance, `${description}: the playback should advance (${detail})`).toBeGreaterThan(0);
    expect(reception.streams, `${description}: an inbound stream should feed the video (${detail})`).toBeGreaterThan(0);
    expect(reception.framesDecoded, `${description}: new frames should be decoded (${detail})`).toBeGreaterThan(0);
    annotate('inbound video', reception);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
};

// Audio packets arrive and decode to sound, not silence.
export const expectAudioReceived = async (page: PlaywrightPage, description: string): Promise<void> => {
  await expect(async () => {
    const delta = await measureInboundRtp(page, 'audio', AUDIO_SAMPLE_WINDOW);
    const detail = JSON.stringify(delta);
    expect(delta.packetsReceived, `${description}: audio packets should arrive (${detail})`).toBeGreaterThan(0);
    expect(delta.totalAudioEnergy, `${description}: the audio should not be silent (${detail})`).toBeGreaterThan(
      MIN_SPEECH_ENERGY,
    );
    annotate('inbound audio', delta);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
};
