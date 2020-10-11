import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {
  UploadRequest,
  UploadedFile,
} from '/imports/api/upload';
import Logger from '/imports/startup/server/logger';

Meteor.publish('upload-request', (credentials, source, filename) => {
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

  Logger.debug(`Publishing upload request for ${meetingId} ${requesterUserId}`);

  return UploadRequest.find(selector);
});

Meteor.publish('uploaded-file', (credentials) => {
  const { meetingId } = credentials;

  check(meetingId, String);

  const selector = { meetingId };

  Logger.debug(`Publishing uploaded file for ${meetingId}`);

  return UploadedFile.find(selector);
});
