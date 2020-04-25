import { Meteor } from 'meteor/meteor';

const TIMER_CONFIG = Meteor.settings.public.timer;

const MILLI_IN_MINUTE = 60000;

const isEnabled = () => TIMER_CONFIG.enabled;

const getDefaultTime = () => TIMER_CONFIG.time * MILLI_IN_MINUTE;

export {
  isEnabled,
  getDefaultTime,
};
