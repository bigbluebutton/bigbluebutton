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

  const onRequestClose = useCallback(async () => {
    try {
      if (!autoplayState.canPlayAudio) {
        await handleStartAudio();
      }
      logger.info({
        logCode: 'livekit_audio_autoplayed',
      }, 'LiveKit: audio autoplayed');
      setIsOpen(false);
    } catch (error) {
      logger.error({
        logCode: 'livekit_audio_autoplay_handle_failed',
        extraInfo: {
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack,
        },
      }, 'LiveKit: failed to handle autoplay');
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
    if (shouldOpen()) openLKAutoplayModal();
  }, [shouldOpen, openLKAutoplayModal]);

  if (!shouldOpen()) return null;

  return (
    <LKAutoplayModal
      autoplayHandler={handleStartAudio}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      priority="medium"
      setIsOpen={setIsOpen}
      isAttemptingAutoplay={autoplayState.isAttempting}
    />
  );
};

export default React.memo(LKAutoplayModalContainer);
