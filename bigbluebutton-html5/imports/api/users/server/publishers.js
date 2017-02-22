import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

import userLeaving from './methods/userLeaving';
import validateAuthToken from './methods/validateAuthToken';

Meteor.publish('users', function (credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  validateAuthToken(credentials);

  // TODO: We need to fix the Authentication flow to enable ACL
  // if (!isAllowedTo('subscribeUsers', credentials)) {
  //   this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'Users'"));
  // }

  this.onStop(() => {
    userLeaving(credentials, requesterUserId);
  });

  const selector = {
    meetingId,
    'user.connection_status': {
      $in: ['online', ''],
    },
  };

  const options = {
    fields: {
      authToken: false,
    },
  };

  Logger.info(`Publishing Users for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Users.find(selector, options);
});
