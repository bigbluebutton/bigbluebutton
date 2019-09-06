import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VideoUsers from '/imports/api/video-users';

function videoUsers(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.debug(`video users of meeting id=${meetingId}`);

  const selector = {
    meetingId,
  };

  return VideoUsers.find(selector);
}

function publish(...args) {
  const boundVideoUsers = videoUsers.bind(this);
  return boundVideoUsers(...args);
}

Meteor.publish('video-users', publish);
