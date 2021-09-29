import { ExternalVideoMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function clearExternalVideoMeeting(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = ExternalVideoMeetings.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared ExternalVideoMeetings in (${meetingId})`);
      }
    } catch (err) {
      Logger.info(`Error on clearing ExternalVideoMeetings in (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = ExternalVideoMeetings.remove({});

      if (numberAffected) {
        Logger.info('Cleared ExternalVideoMeetings in all meetings');
      }
    } catch (err) {
      Logger.error(`Error on clearing ExternalVideoMeetings in all meetings. ${err}`);
    }
  }
}
