import { check } from 'meteor/check';
import { RecordMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function handleRecordingStatusChange({ body }, meetingId) {
  const { time } = body;

  check(meetingId, String);

  check(body, {
    time: Number,
  });

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: { time },
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Changing recording time: ${err}`);
    }
  };

  return RecordMeetings.upsert(selector, modifier, cb);
}
