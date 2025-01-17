import { useState, useCallback } from 'react';
import { Room } from 'livekit-client';
import { useAudioPlayback } from '@livekit/components-react';
import logger from '/imports/startup/client/logger';

export interface AutoplayState {
  hasAttempted: boolean;
  isAttempting: boolean;
  canPlayAudio: boolean;
}

export const useAutoplayState = (liveKitRoom: Room): [AutoplayState, () => Promise<void>] => {
  const { canPlayAudio, startAudio } = useAudioPlayback(liveKitRoom);
  const [state, setState] = useState<AutoplayState>({
    hasAttempted: false,
    isAttempting: false,
    canPlayAudio,
  });

  const handleStartAudio = useCallback(async () => {
    setState((prev) => ({ ...prev, isAttempting: true }));
    try {
      await startAudio();
      setState({
        hasAttempted: true,
        isAttempting: false,
        canPlayAudio: true,
      });
    } catch (error) {
      setState({
        hasAttempted: true,
        isAttempting: false,
        canPlayAudio: false,
      });
      logger.error({
        logCode: 'livekit_audio_autoplay_failed',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack,
        },
      }, 'LiveKit: audio autoplay failed');
      throw error;
    }
  }, [startAudio]);

  return [{ ...state, canPlayAudio }, handleStartAudio];
};

export default {
  useAutoplayState,
};
