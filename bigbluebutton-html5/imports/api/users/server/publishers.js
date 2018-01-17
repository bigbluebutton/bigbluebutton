import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

import userLeaving from './methods/userLeaving';

Meteor.publish('current-user', (credentials) => {
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

function users(credentials) {
  const {
    meetingId,
    requesterUserId,
    requesterToken,
  } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  this.onStop(() => {
    try {
      userLeaving(credentials, requesterUserId);
    } catch (e) {
      Logger.error(`Exception while executing userLeaving: ${e}`);
    }
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
}

function publish(...args) {
  const boundUsers = users.bind(this);
  return mapToAcl('subscriptions.users', boundUsers)(args);
}

Meteor.publish('users', publish);
