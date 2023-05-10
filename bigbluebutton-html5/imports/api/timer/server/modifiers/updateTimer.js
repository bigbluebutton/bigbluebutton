import { check } from 'meteor/check';
import Timer from '/imports/api/timer';
import Logger from '/imports/startup/server/logger';

const getActivateModifier = () => {
  return {
    $set: {
      stopwatch: true,
      active: true,
      running: false,
      time: 0,
      accumulated: 0,
      timestamp: 0,
    },
  };
};

const getDeactivateModifier = () => {
  return {
    $set: { active: false },
  };
};

const getResetModifier = () => {
  return {
    $set: {
      running: false,
      accumulated: 0,
      timestamp: 0,
    },
  };
};

const getStartModifier = (time) => {
  return {
    $set: {
      stopwatch: time === 0,
      running: true,
      timestamp: Date.now(),
      time,
    },
  };
};

const getStopModifier = (accumulated) => {
  return {
    $set: {
      running: false,
      accumulated,
      timestamp: 0,
    },
  };
};

const getResumeModifier = () => {
  return {
    $set: {
      running: true,
      timestamp: Date.now(),
    },
  };
};

export default function updateTimer(action, meetingId, time = 0, accumulated = 0) {
  check(action, String);
  check(meetingId, String);

  const selector = {
    meetingId,
  };

  let modifier;

  switch(action) {
    case 'activate':
      modifier = getActivateModifier();
      break;
    case 'deactivate':
      modifier = getDeactivateModifier();
      break;
    case 'reset':
      modifier = getResetModifier();
      break;
    case 'start':
      modifier = getStartModifier(time);
      break;
    case 'stop':
      modifier = getStopModifier(accumulated);
      break;
    case 'resume':
      modifier = getResumeModifier();
    default:
      Logger.error(`Unhandled timer action=${action}`);
  }

  const cb = (err) => {
    if (err) {
      return Logger.error(`Updating timer at collection: ${err}`);
    }

    return Logger.info(`Updated timer action=${action} meetingId=${meetingId}`);
  };

  return Timer.update(selector, modifier, cb);
}
