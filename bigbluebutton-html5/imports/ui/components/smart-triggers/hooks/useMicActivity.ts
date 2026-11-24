import { useEffect, useRef, useState } from 'react';
// @ts-ignore - it has no types
import hark from 'hark';
import { MicActivity, MicActivityOptions } from '../types';

const hasAudioTracks = (stream: MediaStream | null): stream is MediaStream => (
  !!stream && typeof stream.getAudioTracks === 'function' && stream.getAudioTracks().length > 0
);

// Listens on a clone with its tracks enabled, so speech is detected while the
// user is muted too (muting disables the tracks of the stream being sent).
const useMicActivity = (
  inputStream: MediaStream | null,
  { interval, threshold, enabled }: MicActivityOptions,
): MicActivity => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSignalAt = useRef(Date.now());

  useEffect(() => {
    if (!enabled || !hasAudioTracks(inputStream)) return undefined;

    const clone = inputStream.clone();
    clone.getAudioTracks().forEach((track) => {
      // eslint-disable-next-line no-param-reassign
      track.enabled = true;
    });

    lastSignalAt.current = Date.now();
    const speechEvents = hark(clone, { interval, threshold });
    speechEvents.on('speaking', () => setIsSpeaking(true));
    speechEvents.on('stopped_speaking', () => setIsSpeaking(false));
    speechEvents.on('volume_change', (volume: number) => {
      if (volume > threshold) lastSignalAt.current = Date.now();
    });

    return () => {
      speechEvents.stop();
      clone.getTracks().forEach((track) => track.stop());
      setIsSpeaking(false);
    };
  }, [enabled, inputStream, interval, threshold]);

  return { isSpeaking, lastSignalAt };
};

export default useMicActivity;
