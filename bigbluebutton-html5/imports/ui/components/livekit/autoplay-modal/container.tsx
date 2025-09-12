import React, { useCallback, useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import logger from '/imports/startup/client/logger';
import LKAutoplayModal from './component';
import { useAutoplayState } from './hooks';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useIsAudioConnected from '/imports/ui/components/audio/audio-graphql/hooks/useIsAudioConnected';

const LKAutoplayModalContainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isConnected = useIsAudioConnected();
  const room = useRoomContext();
  const [autoplayState, handleStartAudio] = useAutoplayState(room);
  const audioModalIsOpen = useStorageKey('audioModalIsOpen');

  const openLKAutoplayModal = useCallback(() => {
    if (isOpen) return;

    logger.warn({
      logCode: 'livekit_audio_autoplay_blocked',
    }, 'LiveKit: audio autoplay blocked');
    setIsOpen(true);
  }, [isOpen]);

  const runAutoplayCallback = useCallback(async (indirect = false) => {
    try {
      if (!autoplayState.canPlayAudio) {
        await handleStartAudio(indirect);
      }
      logger.info({
        logCode: 'livekit_audio_autoplayed',
      }, 'LiveKit: audio autoplayed');

      return true;
    } catch (error) {
      const errorMessage = (error as Error)?.message ?? 'unknown error';
      logger.error({
        logCode: 'livekit_audio_autoplay_handle_failed',
        extraInfo: {
          errorMessage,
          errorStack: (error as Error).stack,
        },
      }, `LiveKit: failed to handle autoplay: ${errorMessage}`);

      return false;
    }
  }, [autoplayState.canPlayAudio, handleStartAudio]);

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
    if (shouldOpen()) {
      // Try to run the autoplay callback immediately without a prompt as
      // this might save an user interaction. Since it's indirect (i.e. no user
      // interaction), we mark it (arg true) to avoid flagging an attempt.
      // Attempts are only registered when the user interacts with the modal.
      runAutoplayCallback(true).then((success) => {
        if (!success) openLKAutoplayModal();
      });
    }
  }, [shouldOpen, openLKAutoplayModal]);

  if (!shouldOpen()) return null;

  return (
    <LKAutoplayModal
      autoplayHandler={handleStartAudio}
      isOpen={isOpen}
      onRequestClose={() => {
        runAutoplayCallback();
        setIsOpen(false);
      }}
      priority="medium"
      setIsOpen={setIsOpen}
      isAttemptingAutoplay={autoplayState.isAttempting}
    />
  );
};

export default React.memo(LKAutoplayModalContainer);
