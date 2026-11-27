import { useEffect, useRef, useState } from 'react';
import micActivityMonitor, {
  hasAudioTracks,
  INITIAL_SPEECH_STATE,
  nextSpeechState,
} from '/imports/ui/core/singletons/micActivityMonitor';

export interface MicActivityOptions {
  threshold: number;
  enabled: boolean;
}

export interface MicActivity {
  isSpeaking: boolean;
  lastSignalAt: { readonly current: number };
}

const useMicActivity = (
  inputStream: MediaStream | null,
  { threshold, enabled }: MicActivityOptions,
): MicActivity => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSignalAt = useRef(Date.now());

  useEffect(() => {
    if (!enabled || !hasAudioTracks(inputStream)) return undefined;

    let speech = INITIAL_SPEECH_STATE;
    lastSignalAt.current = Date.now();

    const unsubscribe = micActivityMonitor.subscribe(inputStream, (volume) => {
      if (volume > threshold) lastSignalAt.current = Date.now();
      speech = nextSpeechState(speech, volume, threshold);
      setIsSpeaking(speech.speaking);
    });

    return () => {
      unsubscribe();
      setIsSpeaking(false);
    };
  }, [enabled, inputStream, threshold]);

  return { isSpeaking, lastSignalAt };
};

export default useMicActivity;
