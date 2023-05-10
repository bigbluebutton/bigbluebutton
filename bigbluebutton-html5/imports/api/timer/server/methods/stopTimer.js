import { check } from 'meteor/check';
import Timer from '/imports/api/timer';
import Logger from '/imports/startup/server/logger';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function stopTimer() {
  const { meetingId } = extractCredentials(this.userId);
  check(meetingId, String);

  const now = Date.now();
  const timer = Timer.findOne(
    { meetingId },
    { fields:
      {
        time: 1,
        accumulated: 1,
        timestamp: 1,
      },
    },
  );

  if (timer) {
    const accumulated = timer.accumulated + (now - timer.timestamp);
    updateTimer('stop', meetingId, timer.time, accumulated);
  } else {
    Logger.warn(`Could not stop timer for meetingId=${meetingId}`);
  }
}
