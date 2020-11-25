import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function presentationUploadToken(podId, filename) {
  if (!this.userId) {
    return PresentationUploadToken.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  check(podId, String);
  check(filename, String);

  const selector = {
    meetingId,
    podId,
    userId: requesterUserId,
    filename,
  };

  Logger.debug('Publishing PresentationUploadToken', { meetingId, requesterUserId });

  return PresentationUploadToken.find(selector);
}

function publish(...args) {
  const boundPresentationUploadToken = presentationUploadToken.bind(this);
  return boundPresentationUploadToken(...args);
}

Meteor.publish('presentation-upload-token', publish);
