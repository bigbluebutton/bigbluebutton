import VoiceUsers from '/imports/api/voice-users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

function voiceUser(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  Logger.info(`Publishing Voice User for ${meetingId} ${requesterUserId}`);

  return VoiceUsers.find({ meetingId });
}

function publish(...args) {
  const boundVoiceUser = voiceUser.bind(this);
  return mapToAcl('subscriptions.voiceUser', boundVoiceUser)(args);
}

Meteor.publish('voiceUsers', publish);
