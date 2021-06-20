import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function changeLayoutManager(newLayoutManager) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const selector = {
      meetingId,
    };

    const modifier = {
      $set: {
        layoutManager: newLayoutManager
      },
    };

    const numberAffected = Meetings.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed layout manager from meeting=${meetingId} by id=${requesterUserId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method changeLayoutManager ${err.stack}`);
  }
}
