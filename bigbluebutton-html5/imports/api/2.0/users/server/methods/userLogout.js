import Logger from '/imports/startup/server/logger';

import userLeaving from './userLeaving';

export default function userLogout(credentials) {
  const { requesterUserId } = credentials;

  try {
    userLeaving(credentials, requesterUserId);
  } catch (e) {
    Logger.error(`Exception while executing userLeaving: ${e}`);
  }
}
