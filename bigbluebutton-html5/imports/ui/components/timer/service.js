import Timer from '/imports/api/timer';
import Auth from '/imports/ui/services/auth';
import { Session } from 'meteor/session';
import { ACTIONS, PANELS } from '../layout/enums';

const TIMER_CONFIG = window.meetingClientSettings.public.timer;
const OFFSET_INTERVAL = TIMER_CONFIG.interval.offset;

const MILLI_IN_HOUR = 3600000;
const MILLI_IN_MINUTE = 60000;
const MILLI_IN_SECOND = 1000;

const MAX_HOURS = 23;

const TRACKS = [
  'noTrack',
  'track1',
  'track2',
  'track3',
];

const isMusicEnabled = () => TIMER_CONFIG.music.enabled;

const getCurrentTrack = () => {
  const timer = Timer.findOne(
    { meetingId: Auth.meetingID },
    { fields: { track: 1 } },
  );

  if (timer) return isMusicEnabled() && timer.track;

  return false;
};

const isEnabled = () => TIMER_CONFIG.enabled;

const getMaxHours = () => MAX_HOURS;

const isAlarmEnabled = () => isEnabled() && TIMER_CONFIG.alarm;

const isMusicActive = () => getCurrentTrack() !== TRACKS[0];

const getMusicVolume = () => TIMER_CONFIG.music.volume;

const getMusicTrack = () => TIMER_CONFIG.music.track;

const isActive = () => {
  const timer = Timer.findOne(
    { meetingId: Auth.meetingID },
    { fields: { active: 1 } },
  );

  if (timer) return timer.active;
  return false;
};

const getDefaultTime = () => TIMER_CONFIG.time * MILLI_IN_MINUTE;

const getInterval = () => TIMER_CONFIG.interval.clock;

const isRunning = () => {
  const timer = Timer.findOne(
    { meetingId: Auth.meetingID },
    { fields: { running: 1 } },
  );

  if (timer) return timer.running;
  return false;
};

const isStopwatch = () => {
  const timer = Timer.findOne(
    { meetingId: Auth.meetingID },
    { fields: { stopwatch: 1 } },
  );

  if (timer) return timer.stopwatch;
  return false;
};

const getTimeOffset = () => {
  const timeOffset = Session.get('timeOffset');

  if (timeOffset) return timeOffset;

  return 0;
};

const getElapsedTime = (running, timestamp, timeOffset, accumulated) => {
  if (!running) return accumulated;

  const now = Date.now();

  return accumulated + Math.abs(now - timestamp + timeOffset);
};

const getStopwatch = () => {
  const timer = Timer.findOne(
    { meetingId: Auth.meetingID },
    { fields: { stopwatch: 1 } },
  );

  if (timer) return timer.stopwatch;

  return true;
};

const getTimer = () => {
  const timer = Timer.findOne(
    { meetingId: Auth.meetingID },
    {
      fields:
      {
        stopwatch: 1,
        running: 1,
        time: 1,
        accumulated: 1,
        timestamp: 1,
      },
    },
  );

  if (timer) {
    const {
      stopwatch,
      running,
      time,
      accumulated,
      timestamp,
    } = timer;

    return {
      stopwatch,
      running,
      time,
      accumulated,
      timestamp,
    };
  }

  return {
    stopwatch: true,
    running: false,
    time: getDefaultTime(),
    accumulated: 0,
    timestamp: 0,
  };
};

const getTimeAsString = (time) => {
  const milliseconds = time;

  const hours = Math.floor(milliseconds / MILLI_IN_HOUR);
  const mHours = hours * MILLI_IN_HOUR;

  const minutes = Math.floor((milliseconds - mHours) / MILLI_IN_MINUTE);
  const mMinutes = minutes * MILLI_IN_MINUTE;

  const seconds = Math.floor((milliseconds - mHours - mMinutes) / MILLI_IN_SECOND);

  let timeAsString = '';

  if (hours < 10) {
    timeAsString += `0${hours}:`;
  } else {
    timeAsString += `${hours}:`;
  }

  if (minutes < 10) {
    timeAsString += `0${minutes}:`;
  } else {
    timeAsString += `${minutes}:`;
  }

  if (seconds < 10) {
    timeAsString += `0${seconds}`;
  } else {
    timeAsString += `${seconds}`;
  }

  return timeAsString;
};

const closePanel = (layoutContextDispatch) => {
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
    value: false,
  });
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
    value: PANELS.NONE,
  });
};

const togglePanel = (sidebarContentPanel, layoutContextDispatch) => {
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
    value: sidebarContentPanel !== PANELS.TIMER,
  });
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
    value: sidebarContentPanel === PANELS.TIMER
      ? PANELS.NONE
      : PANELS.TIMER,
  });
};

export default {
  OFFSET_INTERVAL,
  TRACKS,
  isActive,
  isEnabled,
  isMusicEnabled,
  isMusicActive,
  getCurrentTrack,
  getMusicVolume,
  getMusicTrack,
  isRunning,
  isStopwatch,
  isAlarmEnabled,
  getTimeOffset,
  getElapsedTime,
  getInterval,
  getMaxHours,
  getStopwatch,
  getTimer,
  getTimeAsString,
  closePanel,
  togglePanel,
};
