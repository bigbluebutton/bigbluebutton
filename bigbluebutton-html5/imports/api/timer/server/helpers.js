import { Meteor } from 'meteor/meteor';

const TIMER_CONFIG = Meteor.settings.public.timer;

const isEnabled = () => TIMER_CONFIG.enabled;

export {
  isEnabled,
};
