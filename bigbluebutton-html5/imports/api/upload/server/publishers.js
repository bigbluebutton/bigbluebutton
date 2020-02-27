import Upload from '/imports/api/upload';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

Meteor.publish('upload', (credentials, source, filename) => {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(filename, String);

  const selector = {
    meetingId,
    userId: requesterUserId,
    source,
    filename,
  };

  Logger.debug(`Publishing upload for ${meetingId} ${requesterUserId}`);

  return Upload.find(selector);
});
