import Meetings from '/imports/api/meetings';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

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

  try {
    const { numberAffected } = Meetings.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed meeting mute status meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Changing meeting mute status meeting={${meetingId}} ${err}`);
  }
}
