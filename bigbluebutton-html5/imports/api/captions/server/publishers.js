import Captions from '/imports/api/captions';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';

Meteor.publish('captions', function (credentials) {
  // TODO: Some publishers have ACL and others dont
  // if (isAllowedTo('subscribeCaptions', credentials)) {
  //   this.error(new Meteor.Error(402, "The user was not authorized to subscribe for 'captions'"));
  // }

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.verbose(`Publishing Captions for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Captions.find({ meetingId });
});
