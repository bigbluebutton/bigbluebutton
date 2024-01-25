import { Meteor } from 'meteor/meteor';
import muteToggle from './methods/muteToggle';

Meteor.methods({
  toggleVoice: muteToggle,
});
