import { check } from 'meteor/check';
import Pads from '/imports/api/pads';
import Logger from '/imports/startup/server/logger';

export default async function createPad(meetingId, externalId, padId) {
  try {
    check(meetingId, String);
    check(externalId, String);
    check(padId, String);

    const selector = {
      meetingId,
      externalId,
    };

    const modifier = {
      $set: {
        padId,
        pinned: false,
      },
    };

    const { insertedId } = await Pads.upsertAsync(selector, modifier);

    if (insertedId) {
      Logger.info(`Added pad=${padId} external=${externalId} meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted pad=${padId} external=${externalId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding pad to the collection: ${err}`);
  }
}
