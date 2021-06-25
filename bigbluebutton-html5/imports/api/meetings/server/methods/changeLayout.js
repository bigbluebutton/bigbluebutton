import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function changeLayout(newLayout) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const selector = {
      meetingId,
    };

    const modifier = {
      $set: {
        layout: newLayout
      },
    };

    const numberAffected = Meetings.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed layout from meeting=${meetingId} by id=${requesterUserId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method changeLayout ${err.stack}`);
  }
}
