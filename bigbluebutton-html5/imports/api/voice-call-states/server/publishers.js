import VoiceCallStates from '/imports/api/voice-call-states';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function voiceCallStates() {
  if (!this.userId) {
    return VoiceCallStates.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing Voice Call States', { meetingId, requesterUserId });

  return VoiceCallStates.find({ meetingId, userId: requesterUserId });
}

function publish(...args) {
  const boundVoiceCallStates = voiceCallStates.bind(this);
  return boundVoiceCallStates(...args);
}

Meteor.publish('voice-call-states', publish);
