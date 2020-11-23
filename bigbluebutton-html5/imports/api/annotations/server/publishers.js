import Annotations from '/imports/api/annotations';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function annotations() {
  if (!this.userId) {
    return Annotations.find({ meetingId: '' });
  }

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing Annotations', { meetingId, requesterUserId });

  return Annotations.find({ meetingId });
}

function publish(...args) {
  const boundAnnotations = annotations.bind(this);
  return boundAnnotations(...args);
}

Meteor.publish('annotations', publish);
