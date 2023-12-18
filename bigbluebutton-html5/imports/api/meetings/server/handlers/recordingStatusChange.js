import { check } from 'meteor/check';
import { RecordMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default async function handleRecordingStatusChange({ body }, meetingId) {
  const { recording, setBy } = body;
  check(recording, Boolean);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: { recording, setBy },
  };

  try {
    const { numberAffected } = await RecordMeetings.upsertAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed meeting record status id=${meetingId} recording=${recording}`);
    }
  } catch (err) {
    Logger.error(`Changing record status: ${err}`);
  }
}
