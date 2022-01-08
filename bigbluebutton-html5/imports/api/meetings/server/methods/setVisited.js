import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function setVisited(visited) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(visited, Boolean);

    const selector = {
      meetingId,
    };

    const modifier = {
      $set: {
        visited,
      },
    };

    const { insertedId } = Meetings.update(selector, modifier);
    if (insertedId) {
      Logger.info(`Set visited for meeting=${meetingId} by id=${requesterUserId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method setVisited ${err.stack}`);
  }
}
