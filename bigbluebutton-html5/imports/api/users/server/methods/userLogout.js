import { Meteor } from 'meteor/meteor';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Logger from '/imports/startup/server/logger';

import userLeaving from './userLeaving';

export default function userLogout(credentials) {
  if (!isAllowedTo('logoutSelf', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to logoutSelf`);
  }

  const { requesterUserId } = credentials;

  try {
    userLeaving(credentials, requesterUserId);
  } catch(e) {
    Logger.error(`Exception while executing userLeaving: ${e}`);
  }
};
