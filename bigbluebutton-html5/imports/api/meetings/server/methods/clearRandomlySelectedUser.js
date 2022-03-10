import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function clearRandomlySelectedUser() {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const selector = {
      meetingId,
    };

    const modifier = {
      $set: {
        randomlySelectedUser: [],
      },
    };

    const numberAffected = Meetings.update(selector, modifier);
    if (numberAffected) {
      Logger.info(`Cleared randomly selected user from meeting=${meetingId} by id=${requesterUserId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method clearRandomlySelectedUser ${err.stack}`);
  }
}
