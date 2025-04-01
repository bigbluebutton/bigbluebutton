import AudioService from '/imports/ui/components/audio/service';

const playAlertSound = () => {
  AudioService.playAlertSound(`${window.meetingClientSettings.public.app.cdn
    + window.meetingClientSettings.public.app.basename}`
    + '/resources/sounds/notify.mp3');
};

export default {
  playAlertSound,
};
