import { Meteor } from 'meteor/meteor';
//import { check } from 'meteor/check';
import {
  UploadRequest,
  UploadedFile,
} from '/imports/api/upload';
import Logger from '/imports/startup/server/logger';
//Suga
import { extractCredentials } from '/imports/api/common/server/helpers';

// Somebody still sends credentials. This will be a security issue...
function uploadRequest(credentials, source, filename) {
  if (!this.userId) {
    return UploadRequest.find({ meetingId: ''});
  }
  //const { meetingId, requesterUserId } = credentials; // this also works
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const selector = {
    meetingId,
    userId: requesterUserId,
    source,
    filename,
  };

  Logger.debug(`Publishing upload request for ${meetingId} ${requesterUserId}`);

  return UploadRequest.find(selector);
}

function publishRequest(...args) {
  const boundUploadRequest = uploadRequest.bind(this);
  return boundUploadRequest(...args);
}

Meteor.publish('upload-request', publishRequest);

function uploadedFile() {
  if (!this.userId) {
    return UploadedFile.find({ meetingId: ''});
  }
  const { meetingId } = extractCredentials(this.userId);
  
  Logger.debug(`Publishing uploaded file for ${meetingId}`);

  return UploadedFile.find({ meetingId });
}

function publishUpload(...args) {
  const boundUploadedFile = uploadedFile.bind(this);
  return boundUploadedFile(...args);
}

Meteor.publish('uploaded-file', publishUpload);
