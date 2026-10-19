import AudioService from '/imports/ui/components/audio/service';
import { assetUrl } from '/imports/ui/services/url-builder';

const playAlertSound = () => {
  AudioService.playAlertSound(assetUrl('resources/sounds/notify.mp3'));
};

export default {
  playAlertSound,
};
