import { Meteor } from 'meteor/meteor';
import Timer from '/imports/api/timer';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import { Session } from 'meteor/session';
import Users from '/imports/api/users';
import Logger from '/imports/startup/client/logger';
import { ACTIONS, PANELS } from '../layout/enums';

const TIMER_CONFIG = Meteor.settings.public.timer;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
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

const startTimer = () => makeCall('startTimer');

const stopTimer = () => makeCall('stopTimer');

const switchTimer = (stopwatch) => makeCall('switchTimer', stopwatch);

const setTimer = (time) => makeCall('setTimer', time);

const resetTimer = () => makeCall('resetTimer');

const activateTimer = (layoutContextDispatch) => {
    makeCall('activateTimer');
    //Set an observer to switch to timer tab as soon as the timer is activated
    const handle =Timer.find({ meetingId: Auth.meetingID }).observeChanges({
      changed(id, timer) {
        if (timer.active === true) {
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: true,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.TIMER,
          });
        }
        handle.stop();
      }
    });
  };

const deactivateTimer = () => makeCall('deactivateTimer');

const timerEnded = () => makeCall('timerEnded');

const setTrack = (track) => {
  makeCall('setTrack', track);
};

const fetchTimeOffset = () => {
  const t0 = Date.now();

  makeCall('getServerTime').then((result) => {
    if (result === 0) return;
    const t3 = Date.now();

    const ts = result;
    const rtt = t3 - t0;
    const timeOffset = Math.round(ts - rtt / 2 - t0);

    Session.set('timeOffset', timeOffset);
  });
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

const isModerator = () => Users.findOne(
  { userId: Auth.userID },
  { fields: { role: 1 } },
).role === ROLE_MODERATOR;

const setHours = (hours, time) => {
  if (!Number.isNaN(hours) && hours >= 0 && hours <= MAX_HOURS) {
    const currentHours = Math.floor(time / MILLI_IN_HOUR);

    const diff = (hours - currentHours) * MILLI_IN_HOUR;
    setTimer(time + diff);
  } else {
    Logger.warn('Invalid time');
  }
};

const setMinutes = (minutes, time) => {
  if (!Number.isNaN(minutes) && minutes >= 0 && minutes <= 59) {
    const currentHours = Math.floor(time / MILLI_IN_HOUR);
    const mHours = currentHours * MILLI_IN_HOUR;

    const currentMinutes = Math.floor((time - mHours) / MILLI_IN_MINUTE);

    const diff = (minutes - currentMinutes) * MILLI_IN_MINUTE;
    setTimer(time + diff);
  } else {
    Logger.warn('Invalid time');
  }
};

const setSeconds = (seconds, time) => {
  if (!Number.isNaN(seconds) && seconds >= 0 && seconds <= 59) {
    const currentHours = Math.floor(time / MILLI_IN_HOUR);
    const mHours = currentHours * MILLI_IN_HOUR;

    const currentMinutes = Math.floor((time - mHours) / MILLI_IN_MINUTE);
    const mMinutes = currentMinutes * MILLI_IN_MINUTE;

    const currentSeconds = Math.floor((time - mHours - mMinutes) / MILLI_IN_SECOND);

    const diff = (seconds - currentSeconds) * MILLI_IN_SECOND;
    setTimer(time + diff);
  } else {
    Logger.warn('Invalid time');
  }
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
  startTimer,
  stopTimer,
  switchTimer,
  setHours,
  setMinutes,
  setSeconds,
  resetTimer,
  activateTimer,
  deactivateTimer,
  fetchTimeOffset,
  setTrack,
  getTimeOffset,
  getElapsedTime,
  getInterval,
  getMaxHours,
  getStopwatch,
  getTimer,
  getTimeAsString,
  closePanel,
  togglePanel,
  isModerator,
  timerEnded,
};
