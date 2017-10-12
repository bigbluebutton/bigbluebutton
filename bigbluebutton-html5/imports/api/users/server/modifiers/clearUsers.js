import Users from './../../';
import Logger from '/imports/startup/server/logger';

export default function clearUsers(meetingId) {
  if (meetingId) {
    return Users.remove({ meetingId }, Logger.info(`Cleared Users (${meetingId})`));
  }

  return Users.remove({}, Logger.info('Cleared Users (all)'));
}
