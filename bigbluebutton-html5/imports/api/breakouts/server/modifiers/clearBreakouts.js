import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import removeMeeting from '/imports/api/meetings/server/modifiers/removeMeeting';

export default function clearBreakouts(meetingId) {
  let cb = () => {
    Logger.info(`Cleared Breakouts (all)`);
  };

  if (meetingId) {
    const selector = {
      breakoutMeetingId: meetingId,
    };

    cb = () => {
      Logger.info(`Cleared Breakouts (${meetingId})`);
      removeMeeting(meetingId);
    };

    return Breakouts.remove(selector, cb);
  }

  return Breakouts.remove({}, cb);
}
