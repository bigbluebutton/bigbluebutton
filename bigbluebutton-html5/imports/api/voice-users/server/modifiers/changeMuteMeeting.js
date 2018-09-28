import Meetings from '/imports/api/meetings';
import { check } from 'meteor/check';

export default function changeMuteMeeting(meetingId, payload) {
  check(meetingId, String);
  check(payload, {
    muted: Boolean,
    mutedBy: String,
  });

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      'voiceProp.muteOnStart': payload.muted,
    },
  };

  return Meetings.upsert(selector, modifier);
}
