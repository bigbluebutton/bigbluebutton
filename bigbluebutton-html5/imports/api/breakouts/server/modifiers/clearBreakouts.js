import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';

export default function clearBreakouts(meetingId) {
  if (meetingId) {
    return Breakouts.remove({
      breakoutMeetingId: meetingId,
    }, Logger.info(`Cleared Breakouts (${meetingId})`));
  }

  return Breakouts.remove({}, Logger.info(`Cleared Breakouts (all)`));
}
