import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users/index';

const clearUsers = (meetingId) => {
  if (meetingId) {
    return Users.remove({ meetingId }, Logger.info(`Cleared Users (${meetingId})`));
  }

  return Users.remove({}, Logger.info('Cleared Users (all)'));
};

export default clearUsers;
