import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';
import { extractCredentials } from '../../common/server/helpers';

async function videoStreams() {
  const { meetingId, requesterUserId: userId } = extractCredentials(this.userId);

  Logger.debug('Publishing VideoStreams', { meetingId, userId });

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
