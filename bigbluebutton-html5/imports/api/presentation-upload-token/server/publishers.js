import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Logger from '/imports/startup/server/logger';

Meteor.publish('presentation-upload-token', (credentials, podId, filename) => {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(podId, String);
  check(filename, String);

  const selector = {
    meetingId,
    podId,
    userId: requesterUserId,
    filename,
  };

  Logger.debug(`Publishing PresentationUploadToken for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return PresentationUploadToken.find(selector);
});
