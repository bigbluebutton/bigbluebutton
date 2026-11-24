import AudioManager from '/imports/ui/services/audio-manager';
import { addAlert } from '/imports/ui/components/screenreader-alert/service';
import logger from '/imports/startup/client/logger';
import { Hint } from './types';

// Not AudioManager.playAlertSound: that one needs an audio bridge, and an away
// presenter may not be in audio.
const playHintSound = (soundUrl: string) => {
  const audio = new Audio(soundUrl);
  const { outputDeviceId } = AudioManager;

  if (outputDeviceId && typeof audio.setSinkId === 'function') {
    audio.setSinkId(outputDeviceId).catch(() => {});
  }
  audio.play().catch((error) => {
    logger.warn({
      logCode: 'smart_triggers_sound_error',
      extraInfo: { errorName: error.name, errorMessage: error.message },
    }, `Smart triggers could not play a sound: ${error.message}`);
  });
};

const announceHint = (hint: Hint) => {
  addAlert(hint.message);
  if (hint.soundUrl) playHintSound(hint.soundUrl);
};

export default announceHint;
