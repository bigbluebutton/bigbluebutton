import Logger from '/imports/startup/server/logger';
// FIX ME, ADD THIS METHOD TO THE MEETING 2.0
import removeMeeting from '/imports/api/1.1/meetings/server/modifiers/removeMeeting';
import Breakouts from '/imports/api/2.0/breakouts';

export default function clearBreakouts(breakoutMeetingId) {
  if (breakoutMeetingId) {
    const selector = {
      breakoutMeetingId,
    };

    const cb = () => {
      Logger.info(`Cleared Breakouts (${breakoutMeetingId})`);
      removeMeeting(breakoutMeetingId);
    };

    return Breakouts.remove(selector, cb);
  }

  return Breakouts.remove({}, Logger.info('Cleared Breakouts (all)'));
}
