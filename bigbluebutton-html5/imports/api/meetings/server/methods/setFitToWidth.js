import Meetings from '/imports/api/meetings';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function setFitToWidth(fitToWidth) {

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(fitToWidth, Boolean);

    const selector = {
      meetingId,
    };

    const modifier = {
      $set: {
        fitToWidth,
      }
    }

    const { insertedId } = Meetings.upsert(selector, modifier);
    if (insertedId) {
      Logger.info(`Set fitToWidth for meeting=${meetingId} by id=${requesterUserId}`);
    }

  } catch (err) {
    Logger.error(`Exception while invoking method setFitToWidth ${err.stack}`);
  }
}
