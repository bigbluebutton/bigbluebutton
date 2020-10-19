import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function clearRandomlySelectedUser() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const selector = {
    meetingId,
  };

  const cb = (err) => {
    if (err) return Logger.error(`Clearing randomly selected user : ${err}`);
    Logger.info(`Cleared randomly selected user from meeting=${meetingId} by id=${requesterUserId}`);
  };

  return Meetings.update(
    selector,
    {
      $set: {
        randomlySelectedUser: '',
      },
    },
    cb,
  );
}
