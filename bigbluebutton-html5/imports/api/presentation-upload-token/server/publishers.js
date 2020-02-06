import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

Meteor.publish('presentation-upload-token', (podId, filename) => {
  if (!this.userId) {
    return PresentationUploadToken.find({ meetingId: '' });
  }

  // TODO--we need to resubscribe when we have this.userId
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  check(podId, String);
  check(filename, String);

  const selector = {
    meetingId,
    podId,
    userId: requesterUserId,
    filename,
  };

  Logger.debug(`Publishing PresentationUploadToken for ${meetingId} ${requesterUserId}`);

  return PresentationUploadToken.find(selector);
});
