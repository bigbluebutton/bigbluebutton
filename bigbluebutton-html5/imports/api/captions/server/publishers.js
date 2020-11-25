import Captions from '/imports/api/captions';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function captions() {
  if (!this.userId) {
    return Captions.find({ meetingId: '' });
  }
  const { meetingId } = extractCredentials(this.userId);
  Logger.debug('Publishing Captions', { meetingId });

  return Captions.find({ meetingId });
}

function publish(...args) {
  const boundCaptions = captions.bind(this);
  return boundCaptions(...args);
}

Meteor.publish('captions', publish);
