import { Meteor } from 'meteor/meteor';
import Timer from '/imports/api/timer';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';

const TIMER_CONFIG = Meteor.settings.public.timer;

isActive = () => {
  const timer = Timer.findOne(
    { meetingId: Auth.meetingID },
    { fields: { active: 1 } },
  );

  if (timer) return timer.active;
  return false;
};

const isEnabled = () => TIMER_CONFIG.enabled;

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
}

const startTimer = (time) => makeCall('startTimer', time);

const stopTimer = () => makeCall('stopTimer');

const resetTimer = () => makeCall('resetTimer');

const activateTimer = () => makeCall('activateTimer');

const deactivateTimer = () => makeCall('deactivateTimer');

const getInterval = () => TIMER_CONFIG.interval;

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
    time: 0,
    accumulated: 0,
    timestamp: 0,
  }
}

const getTimeAsString = milliseconds => {
  let milli = milliseconds;

  let min = Math.floor(milli / 60000);
  let sec = Math.floor((milli - (min * 60000)) / 1000);
  milli = milli - (min * 60000) - (sec * 1000);

  if (min < 10) min = `0${min}`;
  if (sec < 10) sec = `0${sec}`;
  if (milli < 10) milli = `00${milli}`;
  else if (milli < 100) milli = `0${milli}`;

  return `${min}:${sec}:${milli}`;
};

export default {
  isActive,
  isEnabled,
  isRunning,
  isStopwatch,
  startTimer,
  stopTimer,
  resetTimer,
  activateTimer,
  deactivateTimer,
  getInterval,
  getTimer,
  getTimeAsString,
};
