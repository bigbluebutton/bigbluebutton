import { useEffect, useState, useCallback } from 'react';
import { Room } from 'livekit-client';
import { useAudioPlayback } from '@livekit/components-react';
import logger from '/imports/startup/client/logger';

export interface AutoplayState {
  hasAttempted: boolean;
  isAttempting: boolean;
  canPlayAudio: boolean;
}

// Where a playback start attempt came from:
//   indirect  - no user gesture, the silent recovery attempt (genuine autoplay)
//   button    - the user pressed "Play audio" in the prompt
//   dismissal - the user closed the prompt, which also retries playback
export type AutoplaySource = 'indirect' | 'button' | 'dismissal';

export type AutoplayHandler = (source?: AutoplaySource) => Promise<void>;

export const useAutoplayState = (liveKitRoom: Room | undefined): [AutoplayState, AutoplayHandler] => {
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

  const handleStartAudio = useCallback<AutoplayHandler>(async (source = 'indirect') => {
    // All three start paths converge here, so this is where playback starts are
    // counted. `indirect` means no user interaction, so it does not flag an
    // attempt; attempts are only registered when the user interacts with the modal.
    const indirect = source === 'indirect';

    setState((prev) => ({ ...prev, isAttempting: true }));

    try {
      await startAudio();
      setState({
        hasAttempted: !indirect,
        isAttempting: false,
        canPlayAudio: true,
      });
      logger.info({
        logCode: 'livekit_audio_played',
        extraInfo: { source },
      }, `LiveKit: audio playback started (${source})`);
      // Genuine autoplay: playback started with no user gesture behind it.
      if (indirect) {
        logger.info({
          logCode: 'livekit_audio_autoplayed',
        }, 'LiveKit: audio autoplayed');
      }
    } catch (error) {
      setState({
        hasAttempted: !indirect,
        isAttempting: false,
        canPlayAudio: false,
      });
      logger.error({
        logCode: 'livekit_audio_play_failed',
        extraInfo: {
          source,
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack,
        },
      }, `LiveKit: audio playback failed to start (${source})`);
      throw error;
    }
  }, [startAudio]);

  return [{ ...state, canPlayAudio }, handleStartAudio];
};

export default {
  useAutoplayState,
};
