import { Meteor } from 'meteor/meteor';

const TIMER_CONFIG = Meteor.settings.public.timer;

const MILLI_IN_MINUTE = 60000;

const TRACKS = [
  'noTrack',
  'track1',
  'track2',
  'track3',
];

const isEnabled = () => TIMER_CONFIG.enabled;

const getDefaultTime = () => TIMER_CONFIG.time * MILLI_IN_MINUTE;

const isTrackValid = (track) => TRACKS.includes(track);

export {
  TRACKS,
  isEnabled,
  getDefaultTime,
  isTrackValid,
};
