import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

import userLeaving from './methods/userLeaving';

Meteor.publish('current-user', function (credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const selector = {
    meetingId,
    userId: requesterUserId,
    authToken: requesterToken,
  };

  const options = {
    fields: {
      user: false,
    },
  };

  return Users.find(selector, options);
});

Meteor.publish('users', function (credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  if (!isAllowedTo('subscribeUsers', credentials)) {
    this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'Users'"));
  }

  this.onStop(() => {
    userLeaving(credentials, requesterUserId);
  });

  const selector = {
    meetingId,
  };

  const options = {
    fields: {
      authToken: false,
    },
  };

  Logger.info(`Publishing Users for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Users.find(selector, options);
});
