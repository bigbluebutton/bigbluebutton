import { check } from 'meteor/check';
import { RecordMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function handleRecordingTimerChange({ body }, meetingId) {
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

  try {
    RecordMeetings.upsert(selector, modifier);
  } catch (err) {
    Logger.error(`Changing recording time: ${err}`);
  }
}
