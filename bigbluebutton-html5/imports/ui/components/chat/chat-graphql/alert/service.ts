import AudioService from '/imports/ui/components/audio/service';

export const getChatAlertSoundUrl = () => `${window.meetingClientSettings.public.app.cdn
  + window.meetingClientSettings.public.app.basename}`
  + '/resources/sounds/notify.mp3';

const playAlertSound = () => {
  AudioService.playAlertSound(getChatAlertSoundUrl());
};

export default {
  playAlertSound,
};
