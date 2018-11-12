import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

function whiteboardMultiUser(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);

  Logger.info(`Publishing whiteboard-multi-user for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return WhiteboardMultiUser.find({ meetingId });
}

function publish(...args) {
  const boundMultiUser = whiteboardMultiUser.bind(this);
  return boundMultiUser(...args);
}

Meteor.publish('whiteboard-multi-user', publish);
