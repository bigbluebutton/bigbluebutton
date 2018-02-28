import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { check } from 'meteor/check';


export default function changeWebcamOnlyModerator(meetingId, payload) {
  check(meetingId, String);
  check(payload, {
    webcamsOnlyForModerator: Boolean,
    setBy: String,
  });
  const { webcamsOnlyForModerator } = payload;

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      'usersProp.webcamsOnlyForModerator': webcamsOnlyForModerator,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changwing meeting={${meetingId}} webcam Only for Moderator: ${err}`);
    }

    if (!numChanged) {
      return Logger.info(`meeting={${meetingId}} webcam Only for Moderator were not updated`);
    }

    return Logger.info(`Changed meeting={${meetingId}} updated webcam Only for Moderator`);
  };

  return Meetings.upsert(selector, modifier, cb);
}
