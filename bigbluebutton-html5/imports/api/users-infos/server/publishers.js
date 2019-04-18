import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import UserInfos from '/imports/api/users-infos';
import Logger from '/imports/startup/server/logger';

function userInfos(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  Logger.debug(`Publishing user infos requested by user=${requesterUserId}`);

  return UserInfos.find({ meetingId, requesterUserId });
}

function publish(...args) {
  const boundUserInfos = userInfos.bind(this);
  return boundUserInfos(...args);
}

Meteor.publish('users-infos', publish);
