import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { check } from 'meteor/check';

export default async function changeWebcamOnlyModerator(meetingId, payload) {
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

  try {
    const { numberAffected } = await Meetings.upsertAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed meeting={${meetingId}} updated webcam Only for Moderator`);
    } else {
      Logger.info(`meeting={${meetingId}} webcam Only for Moderator were not updated`);
    }
  } catch (err) {
    Logger.error(`Changwing meeting={${meetingId}} webcam Only for Moderator: ${err}`);
  }
}
