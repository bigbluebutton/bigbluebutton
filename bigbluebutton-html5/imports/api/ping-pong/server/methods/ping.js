import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function ping() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const selector = {
    meetingId,
    userId: requesterUserId,
  };

  const modifier = {
    $set: {
      lastPing: Date.now(),
    },
  };

  try {
    Users.update(selector, modifier);
  } catch (err) {
    Logger.error(`Error updating lastPing for ${requesterUserId}: ${err}`);
  }
}
