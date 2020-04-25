import { Meteor } from 'meteor/meteor';
import Timer from '/imports/api/timer';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import { Session } from 'meteor/session';
import Users from '/imports/api/users';
import { ACTIONS, PANELS } from '../layout/enums';

const TIMER_CONFIG = Meteor.settings.public.timer;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const MILLI_IN_HOUR = 3600000;
const MILLI_IN_MINUTE = 60000;
const MILLI_IN_SECOND = 1000;

isActive = () => {
  const timer = Timer.findOne(
    { meetingId: Auth.meetingID },
    { fields: { active: 1 } },
  );

  if (timer) return timer.active;
  return false;
};

const isEnabled = () => TIMER_CONFIG.enabled;

const getDefaultTime = () => TIMER_CONFIG.time * MILLI_IN_MINUTE;

const getInterval = () => TIMER_CONFIG.interval;

const getPresetSeconds = () => {
  const { preset } = TIMER_CONFIG.preset;

  return preset.map(seconds => seconds * MILLI_IN_SECOND);
};

const getPresetMinutes = () => {
  const { preset } = TIMER_CONFIG.preset;

  return preset.map(minutes => minutes * MILLI_IN_MINUTE);
};

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

const activateTimer = () => makeCall('activateTimer');

const deactivateTimer = () => makeCall('deactivateTimer');


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

const getTimerStatus = () => {
  const timerStatus = Timer.findOne(
    { meetingId: Auth.meetingID },
    { fields:
      {
        stopwatch: 1,
        running: 1,
        time: 1,
      },
    },
  );

  if (timerStatus) {
    const {
      stopwatch,
      running,
      time,
    } = timerStatus;

    return {
      stopwatch,
      running,
      time,
    }
  }

  return {
    stopwatch: true,
    running: false,
    time: getDefaultTime(),
  }
};

const getTimeAsString = (milliseconds, stopwatch) => {
  let milli = milliseconds;

  let hours = Math.floor(milli / MILLI_IN_HOUR);
  const mHours = hours * MILLI_IN_HOUR;

  let minutes = Math.floor((milli - mHours) / MILLI_IN_MINUTE);
  const mMinutes = minutes * MILLI_IN_MINUTE;

  let seconds = Math.floor((milli - mHours - mMinutes) / MILLI_IN_SECOND);
  const mSeconds = seconds * MILLI_IN_SECOND;

  milli = milli - mHours - mMinutes - mSeconds;

  let time = '';

  // Only add hour if it exists
  if (hours > 0) {
    if (hours < 10) {
      time += `0${hours}:`;
    } else {
      time += `${hours}:`;
    }
  }

  // Add minute if exists, has at least an hour
  // or is not stopwatch
  if (minutes > 0 || hours > 0 || !stopwatch) {
    if (hours < 10) {
      time += `0${minutes}:`;
    } else {
      time += `${minutes}:`;
    }
  }

  // Always add seconds
  if (seconds < 10) {
    time += `0${seconds}`;
  } else {
    time += `${seconds}`;
  }

  // Only add milliseconds if it's a stopwatch
  if (stopwatch) {
    if (milli < 10) {
      time += `:00${milli}`;
    } else if (milli < 100) {
      time += `:0${milli}`;
    } else {
      time += `:${milli}`;
    }
  }

  return time;
};

const isPanelOpen = () => Session.get('openPanel') === 'timer';

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

export default {
  isActive,
  isEnabled,
  isRunning,
  isStopwatch,
  startTimer,
  stopTimer,
  switchTimer,
  setTimer,
  resetTimer,
  activateTimer,
  deactivateTimer,
  getInterval,
  getPresetSeconds,
  getPresetMinutes,
  getTimer,
  getTimerStatus,
  getTimeAsString,
  togglePanel,
  isModerator,
};
