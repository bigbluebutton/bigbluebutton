import _ from 'lodash';
import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import userLeaving from './methods/userLeaving';
import { extractCredentials } from '/imports/api/common/server/helpers';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function currentUser() {
  if (!this.userId) {
    return Users.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  const connectionId = this.connection.id;
  const onCloseConnection = Meteor.bindEnvironment(() => {
    try {
      userLeaving(meetingId, requesterUserId, connectionId);
    } catch (e) {
      Logger.error(`Exception while executing userLeaving: ${e}`);
    }
  });

  this._session.socket.on('close', _.debounce(onCloseConnection, 100));

  const selector = {
    meetingId,
    userId: requesterUserId,
  };

  const options = {
    fields: {
      user: false,
      authToken: false, // Not asking for authToken from client side but also not exposing it
    },
  };

  return Users.find(selector, options);
}

function publishCurrentUser(...args) {
  const boundUsers = currentUser.bind(this);
  return boundUsers(...args);
}

Meteor.publish('current-user', publishCurrentUser);

function users(role) {
  if (!this.userId) {
    return Users.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const selector = {
    $or: [
      { meetingId },
    ],
  };

  const User = Users.findOne({ userId: requesterUserId, meetingId }, { fields: { role: 1 } });
  if (!!User && User.role === ROLE_MODERATOR) {
    selector.$or.push({
      'breakoutProps.isBreakoutUser': true,
      'breakoutProps.parentId': meetingId,
      connectionStatus: 'online',
    });
  }

  const options = {
    fields: {
      authToken: false,
      lastPing: false,
    },
  };

  Logger.debug('Publishing Users', { meetingId, requesterUserId });

  return Users.find(selector, options);
}

function publish(...args) {
  const boundUsers = users.bind(this);
  return boundUsers(...args);
}

Meteor.publish('users', publish);
