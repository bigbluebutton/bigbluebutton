import { check } from 'meteor/check';
import Timer from '/imports/api/timer';
import Logger from '/imports/startup/server/logger';
import { getDefaultTime } from '/imports/api/timer/server/helpers';

const getActivateModifier = () => {
  const time = getDefaultTime();
  check(time, Number);

  return {
    $set: {
      stopwatch: true,
      active: true,
      running: false,
      time,
      accumulated: 0,
      timestamp: 0,
      music: false,
    },
  };
};

const getDeactivateModifier = () => {
  return {
    $set: {
      active: false,
      running: false,
    },
  };
};

const getResetModifier = () => {
  return {
    $set: {
      accumulated: 0,
      timestamp: Date.now(),
    },
  };
};

const getStartModifier = () => {
  return {
    $set: {
      running: true,
      timestamp: Date.now(),
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

const getSwitchModifier = (stopwatch) => {
  return {
    $set: {
      stopwatch,
      running: false,
      accumulated: 0,
      timestamp: 0,
      music: false,
    },
  };
};

const getSetModifier = (time) => {
  return {
    $set: {
      running: false,
      accumulated: 0,
      timestamp: 0,
      time,
    },
  };
};

const getMusicModifier = (music) => {
  return {
    $set: {
      music,
    },
  };
};


export default function updateTimer(action, meetingId, time = 0, stopwatch = true, accumulated = 0, music = false) {
  check(action, String);
  check(meetingId, String);
  check(time, Number);
  check(stopwatch, Boolean);
  check(accumulated, Number);
  check(music, Boolean);

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
      modifier = getStartModifier();
      break;
    case 'stop':
      modifier = getStopModifier(accumulated);
      break;
    case 'switch':
      modifier = getSwitchModifier(stopwatch);
      break;
    case 'set':
      modifier = getSetModifier(time);
      break;
    case 'music':
      modifier = getMusicModifier(music);
      break;
    default:
      Logger.error(`Unhandled timer action=${action}`);
  }

  const cb = (err) => {
    if (err) {
      return Logger.error(`Updating timer at collection: ${err}`);
    }

    return Logger.debug(`Updated timer action=${action} meetingId=${meetingId}`);
  };

  return Timer.update(selector, modifier, cb);
}
