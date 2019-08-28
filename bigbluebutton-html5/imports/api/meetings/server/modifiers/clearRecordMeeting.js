import { RecordMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function meetingHasEnded(meetingId) {
  return RecordMeetings.remove({ meetingId }, () => Logger.info(`Cleared record prop from meeting with id ${meetingId}`));
}
