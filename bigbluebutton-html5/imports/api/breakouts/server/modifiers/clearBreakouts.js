import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import removeMeeting from '/imports/api/meetings/server/modifiers/removeMeeting';

export default function clearBreakouts(meetingId) {
  if (meetingId) {
    return Breakouts.remove({
      breakoutMeetingId: meetingId,
    }, () => {
      Logger.info(`Cleared Breakouts (${meetingId})`);
      removeMeeting(meetingId);
    });
  }

  return Breakouts.remove({}, Logger.info(`Cleared Breakouts (all)`));
}
