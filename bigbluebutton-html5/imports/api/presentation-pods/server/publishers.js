import { Meteor } from 'meteor/meteor';
import PresentationPods from '/imports/api/presentation-pods';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function presentationPods() {
  if (!this.userId) {
    return PresentationPods.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  Logger.debug('Publishing presentation-pods', { meetingId, requesterUserId });

  return PresentationPods.find({ meetingId });
}

function publish(...args) {
  const boundPresentationPods = presentationPods.bind(this);
  return boundPresentationPods(...args);
}

Meteor.publish('presentation-pods', publish);
