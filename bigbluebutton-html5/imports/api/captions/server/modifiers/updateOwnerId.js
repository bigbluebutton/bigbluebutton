import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import updateOwner from '/imports/api/captions/server/methods/updateOwner';
import { check } from 'meteor/check';

export default function updateOwnerId(meetingId, userId, padId) {
  check(meetingId, String);
  check(userId, String);
  check(padId, String);

  const selector = {
    meetingId,
    padId,
  };

  const modifier = {
    $set: {
      ownerId: userId,
    },
  };

  try {
    const numberAffected = Captions.update(selector, modifier, { multi: true });

    if (numberAffected) {
      updateOwner(meetingId, userId, padId);
      Logger.verbose('Captions: updated caption', { padId, ownerId: userId });
    }
  } catch (err) {
    Logger.error('Captions: error while updating pad', { err });
  }
}
