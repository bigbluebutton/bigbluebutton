import { RecordMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function meetingHasEnded(meetingId) {
  try {
    const numberAffected = RecordMeetings.remove({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared record prop from meeting with id ${meetingId}`)
    }
  } catch (err) {
    Logger.error(`Error on clearing record prop from meeting with id ${meetingId}. ${err}`);
  }
}
