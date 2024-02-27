import AudioService from '/imports/ui/components/audio/service';
import { Meteor } from 'meteor/meteor';

const playAlertSound = () => {
  AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
    + Meteor.settings.public.app.basename
    + Meteor.settings.public.app.instanceId}`
    + '/resources/sounds/notify.mp3');
};

export default {
  playAlertSound,
};
