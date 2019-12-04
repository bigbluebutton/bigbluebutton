import _ from 'lodash';
import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import userLeaving from './methods/userLeaving';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

Meteor.publish('current-user', function currentUserPub(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  const connectionId = this.connection.id;
  const onCloseConnection = Meteor.bindEnvironment(() => {
    try {
      userLeaving(credentials, requesterUserId, connectionId);
    } catch (e) {
      Logger.error(`Exception while executing userLeaving: ${e}`);
    }
  });

  this._session.socket.on('close', _.debounce(onCloseConnection, 100));

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

function users(credentials, isModerator = false) {
  const {
    meetingId,
    requesterUserId,
    requesterToken,
  } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const selector = {
    $or: [
      { meetingId },
    ],
  };

  if (isModerator) {
    const User = Users.findOne({ userId: requesterUserId });
    if (!!User && User.role === ROLE_MODERATOR) {
      selector.$or.push({
        'breakoutProps.isBreakoutUser': true,
        'breakoutProps.parentId': meetingId,
        connectionStatus: 'online',
      });
    }
  }

  const options = {
    fields: {
      authToken: false,
      lastPing: false,
    },
  };

  Logger.debug(`Publishing Users for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Users.find(selector, options);
}

function publish(...args) {
  const boundUsers = users.bind(this);
  return boundUsers(...args);
}

Meteor.publish('users', publish);
