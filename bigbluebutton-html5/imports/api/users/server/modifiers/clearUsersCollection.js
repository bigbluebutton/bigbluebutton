import Users from '/imports/api/users';
import { logger } from '/imports/startup/server/logger';

// called on server start and on meeting end
export function clearUsersCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Users.remove({
      meetingId: meetingId,
    }, err => {
      if (err != null) {
        return logger.error(`_error ${JSON.stringify(err)} while removing users from ${meetingId}`);
      } else {
        return logger.info(`_cleared Users Collection (meetingId: ${meetingId})!`);
      }
    });
  } else {
    return Users.remove({}, err => {
      if (err != null) {
        return logger.error(`_error ${JSON.stringify(err)} while removing users from all meetings`);
      } else {
        return logger.info('_cleared Users Collection (all meetings)!');
      }
    });
  }
};
