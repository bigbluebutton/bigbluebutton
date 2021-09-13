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

const MAX_TIME = 999
  + (59 * MILLI_IN_SECOND)
  + (59 * MILLI_IN_MINUTE)
  + (MAX_HOURS * MILLI_IN_HOUR);

const getMaxHours = () => MAX_HOURS;

const isAlarmEnabled = () => isEnabled() && TIMER_CONFIG.alarm;

const isMusicEnabled = () => TIMER_CONFIG.music.enabled;

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

const isMusicActive = () => {
  const timer = Timer.findOne(
    { meetingId: Auth.meetingID },
    { fields: { music: 1 } },
  );

  if (timer) return isMusicEnabled() && timer.music;

  return false;
};

const isEnabled = () => TIMER_CONFIG.enabled;

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

const activateTimer = (layoutContextDispatch) => makeCall('activateTimer').then(result => {
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
    value: true,
  });
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
    value: PANELS.TIMER,
  });
});;

const deactivateTimer = () => makeCall('deactivateTimer');

const timerEnded = () => makeCall('timerEnded');

const setMusic = (music) => {
  makeCall('setMusic', music);
};

const fetchTimeOffset = () => {
  const t0 = Date.now();

  makeCall('getServerTime').then(result => {
    const t3 = Date.now();

    const ts = result;
    const rtt = t3 - t0;
    const timeOffset = Math.round(ts - rtt/2 - t0);

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
    { fields:
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
    }
  }

  return {
    stopwatch: true,
    running: false,
    time: getDefaultTime(),
    accumulated: 0,
    timestamp: 0,
  }
};

const getTimeAsString = (time, stopwatch) => {
  let milliseconds = time;

  let hours = Math.floor(milliseconds / MILLI_IN_HOUR);
  const mHours = hours * MILLI_IN_HOUR;

  let minutes = Math.floor((milliseconds - mHours) / MILLI_IN_MINUTE);
  const mMinutes = minutes * MILLI_IN_MINUTE;

  let seconds = Math.floor((milliseconds - mHours - mMinutes) / MILLI_IN_SECOND);
  const mSeconds = seconds * MILLI_IN_SECOND;

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

const isPanelOpen = () => Session.get('openPanel') === 'timer';

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

const isModerator = () => {
  return Users.findOne(
    { userId: Auth.userID },
    { fields: { role: 1 } },
  ).role === ROLE_MODERATOR;
};

const setHours = (hours, time) => {
  if (!isNaN(hours) && hours >= 0 && hours <= MAX_HOURS) {
    const currentHours = Math.floor(time / MILLI_IN_HOUR);

    const diff = (hours - currentHours) * MILLI_IN_HOUR;
    setTimer(time + diff);
  } else {
    Logger.warn('Invalid time');
  }
};

const setMinutes = (minutes, time) => {
  if (!isNaN(minutes) && minutes >= 0 && minutes <= 59) {
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
  if (!isNaN(seconds) && seconds >= 0 && seconds <= 59) {
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
  isActive,
  isEnabled,
  isMusicEnabled,
  isMusicActive,
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
  setMusic,
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
