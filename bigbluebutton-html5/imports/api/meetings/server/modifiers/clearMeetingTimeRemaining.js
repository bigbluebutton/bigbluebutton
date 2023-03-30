import { MeetingTimeRemaining } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default async function clearMeetingTimeRemaining(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = await MeetingTimeRemaining.removeAsync({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared MeetingTimeRemaining in (${meetingId})`);
      }
    } catch (err) {
      Logger.info(`Error on clearing MeetingTimeRemaining in (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = await MeetingTimeRemaining.removeAsync({});

      if (numberAffected) {
        Logger.info('Cleared MeetingTimeRemaining in all meetings');
      }
    } catch (err) {
      Logger.error(`Error on clearing MeetingTimeRemaining in all meetings. ${err}`);
    }
  }
}
