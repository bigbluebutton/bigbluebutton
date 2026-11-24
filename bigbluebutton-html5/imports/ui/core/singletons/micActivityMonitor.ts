// @ts-ignore - it has no types
import hark from 'hark';
import meetingClientSettingsInitialValues from '/imports/ui/core/initial-values/meetingClientSettings';

export type MicVolumeListener = (volume: number) => void;

export type Unsubscribe = () => void;

export interface SpeechState {
  speaking: boolean;
  aboveThreshold: boolean[];
}

interface Harker {
  on: (event: 'volume_change', listener: (volume: number) => void) => void;
  stop: () => void;
}

const DEFAULT_SAMPLE_INTERVAL = meetingClientSettingsInitialValues
  .public.media.audio.micActivitySampleInterval;

// Same hysteresis as hark: speech starts once two of the last three samples
// were above the threshold, and stops after a full history below it.
const SPEECH_HISTORY_SIZE = 10;
const SPEECH_START_WINDOW = 3;
const SPEECH_START_MIN = 2;

export const INITIAL_SPEECH_STATE: SpeechState = {
  speaking: false,
  aboveThreshold: new Array(SPEECH_HISTORY_SIZE).fill(false),
};

export const nextSpeechState = (
  state: SpeechState,
  volume: number,
  threshold: number,
): SpeechState => {
  const isAbove = volume > threshold;
  let { speaking } = state;

  if (isAbove && !speaking) {
    const recent = state.aboveThreshold.slice(-SPEECH_START_WINDOW).filter(Boolean).length;
    speaking = recent >= SPEECH_START_MIN;
  } else if (!isAbove && speaking) {
    speaking = state.aboveThreshold.some(Boolean);
  }

  return {
    speaking,
    aboveThreshold: [...state.aboveThreshold.slice(1), isAbove],
  };
};

export const hasAudioTracks = (stream: MediaStream | null): stream is MediaStream => (
  !!stream && typeof stream.getAudioTracks === 'function' && stream.getAudioTracks().length > 0
);

class MicActivityMonitor {
  private readonly listeners = new Set<MicVolumeListener>();

  private sourceStream: MediaStream | null = null;

  private sampledStream: MediaStream | null = null;

  private harker: Harker | null = null;

  subscribe(stream: MediaStream, listener: MicVolumeListener): Unsubscribe {
    this.listeners.add(listener);
    if (stream !== this.sourceStream) {
      this.sourceStream = stream;
      this.stopSampling();
    }
    if (!this.harker) this.startSampling();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stopSampling();
        this.sourceStream = null;
      }
    };
  }

  // Samples a clone with its tracks enabled, so the user is heard while muted
  // too (muting disables the tracks of the stream being sent).
  private startSampling() {
    if (!hasAudioTracks(this.sourceStream) || this.listeners.size === 0) return;

    const interval = window.meetingClientSettings?.public?.media?.audio?.micActivitySampleInterval
      ?? DEFAULT_SAMPLE_INTERVAL;

    this.sampledStream = this.sourceStream.clone();
    this.sampledStream.getAudioTracks().forEach((track) => {
      // eslint-disable-next-line no-param-reassign
      track.enabled = true;
    });
    this.harker = hark(this.sampledStream, { interval });
    this.harker?.on('volume_change', (volume: number) => {
      this.listeners.forEach((listener) => listener(volume));
    });
  }

  private stopSampling() {
    this.harker?.stop();
    this.sampledStream?.getTracks().forEach((track) => track.stop());
    this.harker = null;
    this.sampledStream = null;
  }
}

const micActivityMonitor = new MicActivityMonitor();

export default micActivityMonitor;
