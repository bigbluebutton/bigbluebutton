import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';
import { extractCredentials } from '/imports/api/common/server/helpers';

function videoStreams() {
  if (!this.userId) {
    return VideoStreams.find({ meetingId: '' });
  }
  const { meetingId } = extractCredentials(this.userId);

  Logger.debug('Publishing video users', { meetingId });

  const selector = {
    meetingId,
  };

  return VideoStreams.find(selector);
}

function publish(...args) {
  const boundVideoStreams = videoStreams.bind(this);
  return boundVideoStreams(...args);
}

Meteor.publish('video-streams', publish);
