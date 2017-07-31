import VoiceUser from '/imports/api/2.0/voice-user';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

function voiceUser(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  Logger.info(`Publishing Voice User for ${meetingId} ${requesterUserId}`);

  return VoiceUser.find({ meetingId });
}

function publish(...args) {
  const boundVoiceUser = voiceUser.bind(this);
  return mapToAcl('subscriptions.voiceUser', boundVoiceUser)(args);
}

Meteor.publish('voiceUser', publish);
