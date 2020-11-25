import Screenshare from '/imports/api/screenshare';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function screenshare() {
  if (!this.userId) {
    return Screenshare.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing Screenshare', { meetingId, requesterUserId });

  return Screenshare.find({ meetingId });
}

function publish(...args) {
  const boundScreenshare = screenshare.bind(this);
  return boundScreenshare(...args);
}

Meteor.publish('screenshare', publish);
