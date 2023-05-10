import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { isEnabled } from '/imports/api/timer/server/helpers';
import addTimer from '/imports/api/timer/server/modifiers/addTimer';

export default function createTimer(meetingId) {
  check(meetingId, String);

  // Avoid timer creation if this feature is disabled
  if (!isEnabled()) {
    Logger.warn(`Timers are disabled for ${meetingId}`);
    return;
  }

  addTimer(meetingId);
}
