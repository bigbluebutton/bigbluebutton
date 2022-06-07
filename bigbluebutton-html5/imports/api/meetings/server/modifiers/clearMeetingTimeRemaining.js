import { MeetingTimeRemaining } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function clearMeetingTimeRemaining(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = MeetingTimeRemaining.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared MeetingTimeRemaining in (${meetingId})`);
      }
    } catch (err) {
      Logger.info(`Error on clearing MeetingTimeRemaining in (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = MeetingTimeRemaining.remove({});

      if (numberAffected) {
        Logger.info('Cleared MeetingTimeRemaining in all meetings');
      }
    } catch (err) {
      Logger.error(`Error on clearing MeetingTimeRemaining in all meetings. ${err}`);
    }
  }
}
