import { Meteor } from 'meteor/meteor';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

import userLeaving from './userLeaving';

export default function userLogout(credentials) {
  if (!isAllowedTo('logoutSelf', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to logoutSelf`);
  }

  const { requesterUserId } = credentials;

  return userLeaving(credentials, requesterUserId);
};
