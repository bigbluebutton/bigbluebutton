import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function whiteboardMultiUser() {
  if (!this.userId) {
    return WhiteboardMultiUser.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing whiteboard-multi-user', { meetingId, requesterUserId });

  return WhiteboardMultiUser.find({ meetingId });
}


function publish(...args) {
  const boundMultiUser = whiteboardMultiUser.bind(this);
  return boundMultiUser(...args);
}

Meteor.publish('whiteboard-multi-user', publish);
