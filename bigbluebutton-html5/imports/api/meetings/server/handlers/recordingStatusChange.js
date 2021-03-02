import { check } from 'meteor/check';
import { RecordMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function handleRecordingStatusChange({ body }, meetingId) {
  const { recording } = body;
  check(recording, Boolean);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: { recording },
  };

  try {
    const { numberAffected } = RecordMeetings.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed meeting record status id=${meetingId} recording=${recording}`);
    }
  } catch (err) {
    Logger.error(`Changing record status: ${err}`);
  }
}
