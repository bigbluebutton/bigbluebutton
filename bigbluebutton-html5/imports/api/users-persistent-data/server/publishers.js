import UsersPersistentData from '/imports/api/users-persistent-data';
import { Meteor } from 'meteor/meteor';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Users from '/imports/api/users';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function usersPersistentData() {
  if (!this.userId) {
    return UsersPersistentData.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  const selector = {
    meetingId,
  };

  const options = {};

  const User = Users.findOne({ userId: requesterUserId, meetingId }, { fields: { role: 1 } });
  if (!User || User.role !== ROLE_MODERATOR) {
    options.fields = {
      lastBreakoutRoom: false,
    };
  }

  return UsersPersistentData.find(selector, options);
}

function publishUsersPersistentData(...args) {
  const boundUsers = usersPersistentData.bind(this);
  return boundUsers(...args);
}

Meteor.publish('users-persistent-data', publishUsersPersistentData);
