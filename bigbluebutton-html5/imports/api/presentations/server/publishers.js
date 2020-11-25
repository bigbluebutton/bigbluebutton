import { Meteor } from 'meteor/meteor';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function presentations() {
  if (!this.userId) {
    return Presentations.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing Presentations', { meetingId, requesterUserId });

  return Presentations.find({ meetingId });
}

function publish(...args) {
  const boundPresentations = presentations.bind(this);
  return boundPresentations(...args);
}

Meteor.publish('presentations', publish);
