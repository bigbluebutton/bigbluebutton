import React, { useCallback, useEffect, useRef } from 'react';
import { useRoomContext } from '@livekit/components-react';
import logger from '/imports/startup/client/logger';
import LKAutoplayModal from './component';
import { useAutoplayState } from './hooks';
import type { AutoplaySource } from './hooks';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useIsAudioConnected from '/imports/ui/components/audio/audio-graphql/hooks/useIsAudioConnected';
import { useModalRegistration } from '/imports/ui/core/singletons/modalController';

const LKAutoplayModalContainer: React.FC = () => {
  // const [isOpen, setIsOpen] = useState(false);
  const isConnected = useIsAudioConnected();
  const room = useRoomContext();
  const [autoplayState, handleStartAudio] = useAutoplayState(room);
  const audioModalIsOpen = useStorageKey('audioModalIsOpen');

  const LKAutoplayModalState = useModalRegistration({
    id: 'LKAutoplayModal',
    priority: 'medium',
  });

  const setIsOpen = (open: boolean) => {
    if (open) {
      LKAutoplayModalState.open();
    } else {
      LKAutoplayModalState.close();
    }
  };

  // Snapshot of the latest committed shouldOpen() and its inputs, used to explain
  // why a block did not end up drawing a prompt. Assigned in an effect (never
  // during render) and read at log time, so it is not the stale pre-await copy
  // captured by the .then continuation below. shouldOpen is declared further
  // down, so a ref is also what keeps this out of openLKAutoplayModal's
  // dependency array, where it would be a TDZ ReferenceError.
  const blockDiagnosticsRef = useRef<() => Record<string, boolean>>(() => ({}));

  const openLKAutoplayModal = useCallback(() => {
    // Test the pending request, not the granted slot: while the registration is
    // queued behind a higher priority modal, isOpen (actualOpen) is still false
    // and this guard would let the same episode log a second block.
    if (LKAutoplayModalState.queuedPosition !== null) return;

    logger.warn({
      logCode: 'livekit_audio_autoplay_blocked',
      extraInfo: blockDiagnosticsRef.current(),
    }, 'LiveKit: audio autoplay blocked');
    setIsOpen(true);
  }, [LKAutoplayModalState.queuedPosition]);

  const runAutoplayCallback = useCallback(async (source: AutoplaySource) => {
    try {
      if (!autoplayState.canPlayAudio) {
        await handleStartAudio(source);
      }

      return true;
    } catch {
      // handleStartAudio already logged the failure with its source.
      return false;
    }
  }, [autoplayState.canPlayAudio, handleStartAudio]);

  const onPromptShown = useCallback(() => {
    logger.info({
      logCode: 'livekit_audio_autoplay_prompt_shown',
    }, 'LiveKit: audio autoplay prompt shown');
  }, []);

  const shouldOpen = useCallback(() => {
    // Note: if the audio modal is still open, wait for it to be closed before
    // rendering the autoplay screen. Reasoning: the user hasn't gone through
    // the audio setup flow yet, which generally "fixes" the autoplay issue by
    // itself (i.e. due to gUM being requested). If the user closes the modal
    // and playback is still blocked, then we can show the autoplay screen.
    return !autoplayState.canPlayAudio
      && isConnected
      && !autoplayState.hasAttempted
      && !audioModalIsOpen;
  }, [
    autoplayState.canPlayAudio,
    isConnected,
    audioModalIsOpen,
    autoplayState.hasAttempted,
  ]);

  useEffect(() => {
    blockDiagnosticsRef.current = () => ({
      canPlayAudio: autoplayState.canPlayAudio,
      isConnected,
      hasAttempted: autoplayState.hasAttempted,
      audioModalIsOpen: Boolean(audioModalIsOpen),
      // A prediction, not a claim that the render committed: it covers the race
      // between logging the block and drawing the prompt, but not the modal
      // queue, which none of the conditions above can see.
      showable: shouldOpen(),
    });
  });

  useEffect(() => {
    if (shouldOpen()) {
      // Try to run the autoplay callback immediately without a prompt as
      // this might save an user interaction. Since it's indirect (i.e. no user
      // interaction), we mark it to avoid flagging an attempt.
      // Attempts are only registered when the user interacts with the modal.
      runAutoplayCallback('indirect').then((success) => {
        if (!success) openLKAutoplayModal();
      });
    }
  }, [shouldOpen, openLKAutoplayModal]);

  if (!shouldOpen()) return null;

  return (
    <LKAutoplayModal
      autoplayHandler={handleStartAudio}
      isOpen={LKAutoplayModalState.isOpen}
      onPromptShown={onPromptShown}
      onRequestClose={() => {
        runAutoplayCallback('dismissal');
        setIsOpen(false);
      }}
      priority="medium"
      setIsOpen={setIsOpen}
      isAttemptingAutoplay={autoplayState.isAttempting}
    />
  );
};

export default React.memo(LKAutoplayModalContainer);
