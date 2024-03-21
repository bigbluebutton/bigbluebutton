import AudioService from '/imports/ui/components/audio/service';

const playAlertSound = () => {
  AudioService.playAlertSound(`${window.meetingClientSettings.public.app.cdn
    + window.meetingClientSettings.public.app.basename
    + window.meetingClientSettings.public.app.instanceId}`
    + '/resources/sounds/notify.mp3');
};

export default {
  playAlertSound,
};
