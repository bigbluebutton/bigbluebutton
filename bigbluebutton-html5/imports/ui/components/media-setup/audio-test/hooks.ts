/* eslint-disable no-underscore-dangle */
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useReactiveVar } from '@apollo/client';
// @ts-ignore - it has no types
import hark from 'hark';
import AudioManager from '/imports/ui/services/audio-manager';
import AudioService from '/imports/ui/components/audio/service';
import LocalEchoService from '/imports/ui/components/audio/local-echo/service';
import { destroyWasmProcessor } from '/imports/ui/components/audio/audio-processor/service';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import { hasMediaDevicesEventTarget } from '/imports/ui/services/webrtc-base/utils';
import logger from '/imports/startup/client/logger';
import { AUDIO_INPUT, AUDIO_OUTPUT } from '/imports/ui/components/media-setup/device-label';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import { toggleMuteMicrophoneSystem } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';

const VOLUME_POLLING_INTERVAL_MS = 100;
// The "relevance factor" that turns hark's dB reading into a linear level: the
// original formula divides by 20.
const DB_AMPLIFICATION = 65;

export interface AudioDevices {
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  refreshDevices: () => Promise<void>;
}

/**
 * Lists the audio devices and keeps the list current as devices come and go.
 * The labels stay empty until the microphone permission is granted: refresh the
 * list once a stream is up.
 */
export const useAudioDevices = (): AudioDevices => {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const permissionStatus = useReactiveVar(AudioManager._permissionStatus.value) as string;

  const refreshDevices = useCallback(() => navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      const audioInputDevices = devices.filter((d) => d.kind === AUDIO_INPUT);
      const audioOutputDevices = devices.filter((d) => d.kind === AUDIO_OUTPUT);
      setInputDevices(audioInputDevices);
      setOutputDevices(audioOutputDevices);
      AudioManager.inputDevices = audioInputDevices;
      AudioManager.outputDevices = audioOutputDevices;
    })
    .catch((error) => {
      logger.warn({
        logCode: 'audio_test_enumerate_devices_error',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, `Audio test: error enumerating devices - {${error.name}: ${error.message}}`);
    }), []);

  useEffect(() => {
    refreshDevices();
  }, [permissionStatus, refreshDevices]);

  useEffect(() => {
    if (!hasMediaDevicesEventTarget()) return undefined;

    navigator.mediaDevices.addEventListener('devicechange', refreshDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refreshDevices);
    };
  }, [refreshDevices]);

  return { inputDevices, outputDevices, refreshDevices };
};

const releasePreviewStream = (stream: MediaStream) => {
  destroyWasmProcessor(stream);
  MediaStreamUtils.stopMediaStreamTracks(stream);
};

const acquirePreviewStream = (inputDeviceId: string): Promise<MediaStream> => {
  // Connected on the same device: clone the bridge stream instead of a new gUM.
  // No trailing permission prompt in finicky browsers and no second processing
  // pipeline (WASM).
  if (AudioManager.isConnected) {
    const bridgeStream = AudioManager.inputStream as MediaStream | null;

    if (bridgeStream?.active
      && bridgeStream.getAudioTracks().some((t) => t.readyState === 'live')
      && MediaStreamUtils.extractDeviceIdFromStream(bridgeStream, 'audio') === inputDeviceId) {
      const clonedStream = bridgeStream.clone();
      // A muted user still has to reach the meter: only the local clone is unmuted.
      clonedStream.getAudioTracks().forEach((track) => {
        // eslint-disable-next-line no-param-reassign
        track.enabled = true;
      });

      return Promise.resolve(clonedStream);
    }
  }

  const constraints = {
    audio: AudioService.getAudioConstraints({ deviceId: inputDeviceId }),
  };

  // A preview: its processor must not replace the one of the call.
  return AudioService.doGUM(constraints, { retryOnFailure: true, adoptProcessorAsPrimary: false });
};

export interface AudioPreviewStream {
  stream: MediaStream | null;
  /** The device the browser opened, which can differ from the requested one. */
  deviceId: string | null;
  loading: boolean;
}

/**
 * A microphone stream for the meter and the echo test, released when the device
 * changes or the caller unmounts. An empty id opens the browser's default device.
 */
export const useAudioPreviewStream = (
  inputDeviceId: string,
  onStreamReady?: (stream: MediaStream) => void,
): AudioPreviewStream => {
  const [preview, setPreview] = useState<AudioPreviewStream>({
    stream: null,
    deviceId: null,
    loading: true,
  });
  const onStreamReadyRef = useRef(onStreamReady);
  onStreamReadyRef.current = onStreamReady;

  useEffect(() => {
    let cancelled = false;
    let acquiredStream: MediaStream | null = null;

    // The previous stream was released by the cleanup below.
    setPreview((current) => ({ ...current, stream: null, loading: true }));

    acquirePreviewStream(inputDeviceId)
      .then((stream) => {
        if (cancelled) {
          releasePreviewStream(stream);
          return;
        }

        acquiredStream = stream;
        setPreview({
          stream,
          deviceId: MediaStreamUtils.extractDeviceIdFromStream(stream, 'audio') || inputDeviceId,
          loading: false,
        });
        onStreamReadyRef.current?.(stream);
      })
      .catch((error) => {
        logger.warn({
          logCode: 'audio_test_gum_failed',
          extraInfo: {
            inputDeviceId,
            errorName: error?.name,
            errorMessage: error?.message,
          },
        }, `Audio test: gUM failed - {${error?.name}: ${error?.message}}`);

        if (!cancelled) setPreview({ stream: null, deviceId: null, loading: false });
      });

    return () => {
      cancelled = true;
      if (acquiredStream) releasePreviewStream(acquiredStream);
    };
  }, [inputDeviceId]);

  return preview;
};

/**
 * The input level of a stream, from 0 to `range`, smoothed and floored so that
 * background noise does not re-render on every sample.
 */
export const useStreamVolume = (
  stream: MediaStream | null,
  range = 1,
  floor = 0,
): number => {
  // Steps of a fiftieth of the range: finer ones only add re-renders.
  const step = range / 50;
  const volumeRef = useRef(floor);
  const [volume, setVolume] = useState(floor);

  useEffect(() => {
    volumeRef.current = floor;
    setVolume(floor);

    if (!stream) return undefined;

    const observer = hark(stream, { interval: VOLUME_POLLING_INTERVAL_MS });
    observer.on('volume_change', (dbVolume: number) => {
      const previousVolume = volumeRef.current;
      const linearVolume = (10 ** (dbVolume / DB_AMPLIFICATION)) * range;
      // Below a tenth of the range is noise. Above it, the next value is eased
      // from the previous one.
      const nextVolume = (linearVolume <= (range / 10))
        ? floor
        : Math.round(((0.65 * previousVolume) + (0.35 * linearVolume)) / step) * step;

      if (previousVolume !== nextVolume) {
        volumeRef.current = nextVolume;
        setVolume(nextVolume);
      }
    });

    return () => observer.stop();
  }, [stream, range, floor, step]);

  return volume;
};

type LoopbackAgent = { stop: () => void };

interface LocalEchoOptions {
  stream: MediaStream | null;
  outputDeviceId?: string | null;
  initialHearingState?: boolean;
}

export interface LocalEcho {
  hearing: boolean;
  setHearing: (hearing: boolean) => void;
}

/**
 * Plays the microphone back on the output device, so the user can hear themselves.
 */
export const useLocalEcho = ({
  stream,
  outputDeviceId = null,
  initialHearingState = false,
}: LocalEchoOptions): LocalEcho => {
  const loopbackAgent = useRef<LoopbackAgent | null>(null);
  const [hearing, setHearing] = useState(initialHearingState);

  useEffect(() => {
    if (LocalEchoService.shouldUseRTCLoopback()) {
      loopbackAgent.current = LocalEchoService.createAudioRTCLoopback();
    }

    return () => {
      loopbackAgent.current?.stop();
      LocalEchoService.deattachEchoStream();
    };
  }, []);

  useEffect(() => {
    if (hearing) {
      LocalEchoService.setAudioSink(outputDeviceId);
      LocalEchoService.playEchoStream(stream, loopbackAgent.current);
    } else {
      LocalEchoService.deattachEchoStream();
    }
  }, [stream, hearing]);

  useEffect(() => {
    if (outputDeviceId) LocalEchoService.setAudioSink(outputDeviceId);
  }, [outputDeviceId]);

  return { hearing, setHearing };
};

/**
 * Mutes the user in the audio while they hear themselves, as the classic audio
 * modal does during its echo test, and unmutes them when it stops.
 */
export const useMuteWhileHearing = (hearing: boolean): void => {
  const toggleVoice = useToggleVoice();

  useEffect(() => {
    if (!hearing || !AudioManager.isConnected || AudioManager.isMuted) return undefined;

    toggleMuteMicrophoneSystem(false, toggleVoice);
    // A listen-only user is muted for good: nothing to restore.
    if (AudioManager.inputDeviceId === 'listen-only') return undefined;

    return () => toggleMuteMicrophoneSystem(true, toggleVoice);
  }, [hearing]);
};

/**
 * The id to show for a device list: the given one while it is listed, the first
 * device otherwise (unplugged, or never picked).
 */
export const resolveDeviceId = (devices: MediaDeviceInfo[], deviceId: string | null): string => (
  devices.some((d) => d.deviceId === deviceId)
    ? deviceId as string
    : devices[0]?.deviceId ?? ''
);
