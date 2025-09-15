import { useEffect, useState, useCallback } from 'react';
import { Room } from 'livekit-client';
import { useAudioPlayback } from '@livekit/components-react';
import logger from '/imports/startup/client/logger';

export interface AutoplayState {
  hasAttempted: boolean;
  isAttempting: boolean;
  canPlayAudio: boolean;
}

export type AutoplayHandler = (indirect?: boolean) => Promise<void>;

export const useAutoplayState = (liveKitRoom: Room): [AutoplayState, AutoplayHandler] => {
  const { canPlayAudio, startAudio } = useAudioPlayback(liveKitRoom);
  const [state, setState] = useState<AutoplayState>({
    hasAttempted: false,
    isAttempting: false,
    canPlayAudio,
  });

  useEffect(() => {
    // Track canPlayAudio as it might save an user interaction
    if (canPlayAudio) setState((prev) => ({ ...prev, canPlayAudio }));
  }, [canPlayAudio]);

  // Reset attempt state if canPlayAudio changes to false and
  // an attempt was already registered. This is to ensure that if playback
  // state is marked as denied, but attempted, we can reset the state
  // for the next user interaction.
  useEffect(() => {
    if (!canPlayAudio && state.hasAttempted) {
      setState((prev) => ({ ...prev, hasAttempted: false }));
    }
  }, [canPlayAudio, state]);

  const handleStartAudio = useCallback<AutoplayHandler>(async (indirect = false) => {
    // `indirect`: if true, it means the user did not directly interact with the
    // UI to start audio. In those cases, attempts should not be flagged.
    setState((prev) => ({ ...prev, isAttempting: true }));

    try {
      await startAudio();
      setState({
        hasAttempted: !indirect,
        isAttempting: false,
        canPlayAudio: true,
      });
    } catch (error) {
      setState({
        hasAttempted: !indirect,
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
