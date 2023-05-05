import { check } from 'meteor/check';
import { PadsUpdates } from '/imports/api/pads';
import { getDataFromChangeset } from '/imports/api/pads/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function updatePad(meetingId, externalId, padId, userId, rev, changeset) {
  try {
    check(meetingId, String);
    check(externalId, String);
    check(padId, String);
    check(userId, String);
    check(rev, Number);
    check(changeset, String);

    const selector = {
      meetingId,
      externalId,
    };

    const modifier = {
      $set: {
        padId,
        userId,
        rev,
        changeset,
        data: getDataFromChangeset(changeset),
      },
    };

    PadsUpdates.upsert(selector, modifier);
    Logger.debug(`Added pad update external=${externalId} user=${userId} rev=${rev} meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Adding pad update to the collection: ${err}`);
  }
}
