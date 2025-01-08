import React, { useCallback, useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useRoomContext } from '@livekit/components-react';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import LKAutoplayModal from './component';
import { useAutoplayState } from './hooks';

const LKAutoplayModalContainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // @ts-ignore
  // eslint-disable-next-line no-underscore-dangle
  const isConnected = useReactiveVar(AudioManager._isConnected.value);
  const room = useRoomContext();
  const [autoplayState, handleStartAudio] = useAutoplayState(room);

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

  useEffect(() => {
    if (!autoplayState.canPlayAudio && isConnected && !autoplayState.hasAttempted) {
      openLKAutoplayModal();
    }
  }, [autoplayState.canPlayAudio, isConnected, autoplayState.hasAttempted]);

  if (!isConnected || autoplayState.canPlayAudio) return null;

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
