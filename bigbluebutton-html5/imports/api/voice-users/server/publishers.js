import VoiceUsers from '/imports/api/voice-users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import ejectUserFromVoice from './methods/ejectUserFromVoice';

function voiceUser(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  const onCloseConnection = Meteor.bindEnvironment(() => {
    try {
      // I used user because voiceUser is the function's name
      const User = VoiceUsers.findOne({ meetingId, requesterUserId });
      if (User) {
        ejectUserFromVoice({ meetingId, requesterUserId }, requesterUserId);
      }
    } catch (e) {
      Logger.error(`Exception while executing ejectUserFromVoice: ${e}`);
    }
  });

  Logger.debug(`Publishing Voice User for ${meetingId} ${requesterUserId}`);

  this._session.socket.on('close', _.debounce(onCloseConnection, 100));
  return VoiceUsers.find({ meetingId });
}

function publish(...args) {
  const boundVoiceUser = voiceUser.bind(this);
  return boundVoiceUser(...args);
}

Meteor.publish('voiceUsers', publish);
