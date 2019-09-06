import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';

function videoStreams(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.debug(`video users of meeting id=${meetingId}`);

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
