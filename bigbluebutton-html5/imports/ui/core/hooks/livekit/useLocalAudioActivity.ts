/* eslint-disable no-underscore-dangle */
import { useEffect, useRef } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';
// @ts-ignore - hark has no types
import hark from 'hark';
import AudioManager from '/imports/ui/services/audio-manager';

const VOLUME_POLLING_INTERVAL_MS = 100;
// Match the mic level meter's noise floor in media-setup/audio-test/hooks.ts:
// linearVolume = 10 ** (dbVolume / 65) <= 0.1 is treated as background noise.
const DB_AMPLIFICATION = 65;
const NOISE_FLOOR_RATIO = 0.1;

// Hold local speaking briefly across short pauses between syllables so the
// talking indicator does not flicker off while LiveKit still reports speech.
const LOCAL_AUDIO_HOLD_MS = 400;

// null = no running local audio analyser (fall back to LiveKit).
const localAudioActiveVar = makeVar<boolean | null>(null);

export const isLocalParticipantSpeaking = (
  isSpeaking: boolean,
  isMuted: boolean,
  localAudioActive: boolean | null,
): boolean => {
  if (!isSpeaking || isMuted) return false;
  return localAudioActive === null ? true : localAudioActive;
};

/**
 * Derives whether the local microphone stream exceeds the same noise floor
 * used by the mic level meter (`useStreamVolume`). Mounted once in its own
 * leaf inside `LiveKitVoiceActivityAdapter` whenever LiveKit audio is active.
 */
export const useDeriveLocalAudioActivity = (): void => {
  // @ts-ignore - JS AudioManager reactive vars
  const inputStream = useReactiveVar(AudioManager._inputStream) as MediaStream | null;
  // @ts-ignore - JS AudioManager reactive vars
  const isMuted = useReactiveVar(AudioManager._isMuted.value) as boolean;
  // @ts-ignore - JS AudioManager reactive vars
  const isListenOnly = useReactiveVar(AudioManager._isListenOnly.value) as boolean;

  const hasLiveMicTrack = Boolean(
    inputStream?.active
    && inputStream.getAudioTracks().some((t) => t.readyState === 'live'),
  );
  const monitoredStream = !isMuted && !isListenOnly && hasLiveMicTrack ? inputStream : null;
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearHoldTimer = () => {
      if (holdTimerRef.current !== null) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };

    if (isMuted) {
      clearHoldTimer();
      localAudioActiveVar(false);
      return clearHoldTimer;
    }

    if (!monitoredStream) {
      clearHoldTimer();
      localAudioActiveVar(null);
      return clearHoldTimer;
    }

    const observer = hark(monitoredStream, { interval: VOLUME_POLLING_INTERVAL_MS });
    if (observer.state !== 'running') {
      localAudioActiveVar(null);
      observer.resume?.().catch(() => {});
    }

    observer.on('state_change', (state: string) => {
      if (state !== 'running') {
        clearHoldTimer();
        localAudioActiveVar(null);
      }
    });

    observer.on('volume_change', (dbVolume: number) => {
      if (observer.state !== 'running') {
        if (localAudioActiveVar() !== null) {
          clearHoldTimer();
          localAudioActiveVar(null);
        }
        return;
      }

      const linearVolume = 10 ** (dbVolume / DB_AMPLIFICATION);
      if (linearVolume > NOISE_FLOOR_RATIO) {
        clearHoldTimer();
        if (localAudioActiveVar() !== true) {
          localAudioActiveVar(true);
        }
      } else if (localAudioActiveVar() === true) {
        if (holdTimerRef.current === null) {
          holdTimerRef.current = setTimeout(() => {
            holdTimerRef.current = null;
            localAudioActiveVar(false);
          }, LOCAL_AUDIO_HOLD_MS);
        }
      } else if (localAudioActiveVar() !== false) {
        localAudioActiveVar(false);
      }
    });

    return () => {
      // hark's stop() emits a final volume_change synchronously, which could arm a new
      // hold timer; stop first, then clear it.
      observer.stop();
      clearHoldTimer();
      localAudioActiveVar(null);
    };
  }, [isMuted, monitoredStream]);
};

export const useIsLocalAudioActive = (): boolean | null => useReactiveVar(localAudioActiveVar);
