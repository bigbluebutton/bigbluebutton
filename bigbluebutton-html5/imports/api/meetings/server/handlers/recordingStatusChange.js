import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';

export default function handleRecordingStatusChange({ payload }) {
  const meetingId = arg.payload.meeting_id;
  const intendedForRecording = arg.payload.recorded;
  const currentlyBeingRecorded = arg.payload.recording;

  check(meetingId, String);
  check(intendedForRecording, Boolean);
  check(currentlyBeingRecorded, Boolean);

  const selector = {
    meetingId,
    intendedForRecording,
  };

  const modifier = {
    $set: {
      currentlyBeingRecorded,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating meeting recording status: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated meeting recording status id=${meetingId}`);
    }
  };

  return Meetings.update(selector, modifier, cb);
};
