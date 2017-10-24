import { check } from 'meteor/check';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function handleRecordingStatusChange({ body }, meetingId) {
  const { recording } = body;
  check(recording, Boolean);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: { 'recordProp.recording': recording },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Changing record status: ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Changed meeting record status id=${meetingId} recording=${recording}`);
    }
  };

  return Meetings.upsert(selector, modifier, cb);
}
