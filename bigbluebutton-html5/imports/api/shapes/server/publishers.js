import Shapes from '/imports/api/shapes';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

Meteor.publish('shapes', (credentials) => {
  // TODO: Some publishers have ACL and others dont
  // if (!isAllowedTo('@@@', credentials)) {
  //   this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'shapes'"));
  // }

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing Shapes for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Shapes.find({ meetingId });
});
