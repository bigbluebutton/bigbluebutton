import UsersPersistentData from '/imports/api/users-persistent-data';
import { Meteor } from 'meteor/meteor';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

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

  return UsersPersistentData.find(selector);
}

function publishUsersPersistentData(...args) {
  const boundUsers = usersPersistentData.bind(this);
  return boundUsers(...args);
}

Meteor.publish('users-persistent-data', publishUsersPersistentData);
