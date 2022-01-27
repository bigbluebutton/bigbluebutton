import UsersPersistentData from '/imports/api/users-persistent-data';
import { Meteor } from 'meteor/meteor';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Users from '/imports/api/users';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

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

  const User = Users.findOne({ userId: requesterUserId, meetingId }, { fields: { role: 1 } });
  if (!!User && User.role === ROLE_VIEWER) {
    // viewers are allowed to see other users' data if:
    // user is logged in or user sent a message in chat
    const viewerSelector = {
      meetingId,
      $or: [
        {
          hasMessages: true,
        },
        {
          loggedOut: false,
        },
      ],
    };
    return UsersPersistentData.find(viewerSelector);
  }
  return UsersPersistentData.find(selector);
}

function publishUsersPersistentData(...args) {
  const boundUsers = usersPersistentData.bind(this);
  return boundUsers(...args);
}

Meteor.publish('users-persistent-data', publishUsersPersistentData);
