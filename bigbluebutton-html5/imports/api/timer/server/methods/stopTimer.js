import { check } from 'meteor/check';
import Timer from '/imports/api/timer';
import Logger from '/imports/startup/server/logger';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function stopTimer() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  check(meetingId, String);
  check(requesterUserId, String);

  const now = Date.now();
  const timer = Timer.findOne(
    { meetingId },
    { fields:
      {
        stopwatch: 1,
        time: 1,
        accumulated: 1,
        timestamp: 1,
      },
    },
  );

  if (timer) {
    const {
      stopwatch,
      time,
      timestamp,
    } = timer;

    const accumulated = timer.accumulated + (now - timestamp);
    updateTimer({
      action: 'stop',
      meetingId,
      requesterUserId,
      time,
      stopwatch,
      accumulated,
    });
  } else {
    Logger.warn(`Could not stop timer for meetingId=${meetingId}`);
  }
}
