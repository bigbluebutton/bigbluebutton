import { Meteor } from 'meteor/meteor';
import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function userInfos() {
  if (!this.userId) {
    return UserInfos.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing user infos requested', { requesterUserId });

  return UserInfos.find({ meetingId, requesterUserId });
}

function publish(...args) {
  const boundUserInfos = userInfos.bind(this);
  return boundUserInfos(...args);
}

Meteor.publish('users-infos', publish);
