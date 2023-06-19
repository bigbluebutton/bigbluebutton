import { check } from 'meteor/check';
import Timer from '/imports/api/timer';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import { TRACKS, getInitialState } from '/imports/api/timer/server/helpers';
import { sysStopTimer } from '../methods/stopTimer';
import { sysEndTimer } from '../methods/endTimer';

const getActivateModifier = () => ({
  $set: {
    active: true,
    ...getInitialState(),
    ended: 0,
  },
});

const getDeactivateModifier = () => ({
  $set: {
    active: false,
    running: false,
    ended: 0,
  },
});

const getResetModifier = () => ({
  $set: {
    accumulated: 0,
    timestamp: Date.now(),
    ended: 0,
  },
});

const handleTimerEndedNotifications = (fields, meetingId, handle) => {
  const meetingUsers = Users.find({ meetingId }).count();

  if (fields.running === false) {
    handle.stop();
  }

  if (fields.ended >= meetingUsers) {
    sysStopTimer(meetingId);
    sysEndTimer(meetingId);
  }
};

const setTimerEndObserver = (meetingId) => {
  const { stopwatch } = Timer.findOne({ meetingId });

  if (stopwatch === false) {
    const meetingTimer = Timer.find(
      { meetingId },
      { fields: { ended: 1, running: 1 } },
    );
    const handle = meetingTimer.observeChanges({
      changed: (id, fields) => {
        handleTimerEndedNotifications(fields, meetingId, handle);
      },
    });
  }
};

const getStartModifier = () => ({
  $set: {
    running: true,
    timestamp: Date.now(),
    ended: 0,
  },
});

const getStopModifier = (accumulated) => ({
  $set: {
    running: false,
    accumulated,
    timestamp: 0,
    ended: 0,
  },
});

const getSwitchModifier = (stopwatch) => ({
  $set: {
    stopwatch,
    running: false,
    accumulated: 0,
    timestamp: 0,
    track: TRACKS[0],
    ended: 0,
  },
});

const getSetModifier = (time) => ({
  $set: {
    running: false,
    accumulated: 0,
    timestamp: 0,
    time,
  },
});

const getTrackModifier = (track) => ({
  $set: {
    track,
  },
});

const getEndedModifier = () => ({
  $inc: {
    ended: 1,
  },
});

const logTimer = (meetingId, requesterUserId, action, stopwatch, time, track) => {
  if (action === 'switch') {
    Logger.info(`Timer: meetingId=${meetingId} requesterUserId=${requesterUserId} action=${action} stopwatch=${stopwatch} `);
  } else if (action === 'set' && time !== 0) {
    Logger.info(`Timer: meetingId=${meetingId} requesterUserId=${requesterUserId} action=${action} ${time}ms`);
  } else if (action === 'track') {
    Logger.info(`Timer: meetingId=${meetingId} requesterUserId=${requesterUserId} action=${action} changed to ${track}`);
  } else {
    Logger.info(`Timer: meetingId=${meetingId} requesterUserId=${requesterUserId} action=${action}`);
  }
};

export default function updateTimer({
  action,
  meetingId,
  requesterUserId,
  time = 0,
  stopwatch = true,
  accumulated = 0,
  track = TRACKS[0],
}) {
  check(action, String);
  check(meetingId, String);
  check(requesterUserId, String);
  check(time, Number);
  check(stopwatch, Boolean);
  check(accumulated, Number);
  check(track, String);

  const selector = {
    meetingId,
  };

  let modifier;

  switch (action) {
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
      setTimerEndObserver(meetingId);
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
    case 'track':
      modifier = getTrackModifier(track);
      break;
    case 'ended':
      modifier = getEndedModifier();
      break;
    default:
      Logger.error(`Unhandled timer action=${action}`);
  }

  try {
    const { numberAffected } = Timer.upsert(selector, modifier);

    if (numberAffected) {
      logTimer(meetingId, requesterUserId, action, stopwatch, time, track);
    }
  } catch (err) {
    Logger.error(`Updating timer: ${err}`);
  }
}
