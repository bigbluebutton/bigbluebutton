import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

import setConnectionStatus from './modifiers/setConnectionStatus';

Meteor.publish('Users', function (credentials) {
  // TODO: Some publishers have ACL and others dont
  // if (!isAllowedTo('@@@', credentials)) {
  //   this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'Users'"));
  // }

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  // TODO:
  // - Add reconnection handlers
  // - Add validateAuthToken stuff
  // - Update `connection_status` when the user disconnects

  this.onStop(() => {
    setConnectionStatus(meetingId, requesterUserId, 'offline');
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
