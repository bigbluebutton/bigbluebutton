import VoiceUsers from '/imports/api/voice-users';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import ejectUserFromVoice from './methods/ejectUserFromVoice';

function voiceUser() {
  if (!this.userId) {
    return VoiceUsers.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);
  const onCloseConnection = Meteor.bindEnvironment(() => {
    try {
      // I used user because voiceUser is the function's name
      const User = VoiceUsers.findOne({ meetingId, requesterUserId });
      if (User) {
        ejectUserFromVoice(requesterUserId);
      }
    } catch (e) {
      Logger.error(`Exception while executing ejectUserFromVoice for ${requesterUserId}: ${e}`);
    }
  });

  Logger.debug('Publishing Voice User', { meetingId, requesterUserId });

  this._session.socket.on('close', _.debounce(onCloseConnection, 100));
  return VoiceUsers.find({ meetingId });
}

function publish(...args) {
  const boundVoiceUser = voiceUser.bind(this);
  return boundVoiceUser(...args);
}

Meteor.publish('voiceUsers', publish);
