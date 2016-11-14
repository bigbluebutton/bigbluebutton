import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';

export default function (meetingId) {
  return Breakouts.remove({
    breakoutMeetingId: meetingId,
  }, Logger.info(`Cleared Breakouts (${meetingId})`));
}
