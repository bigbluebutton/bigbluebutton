import { check } from 'meteor/check';
import VoiceUsers from '/imports/api/voice-users/';
import Meetings from '/imports/api/meetings';
import addUser from '/imports/api/users/server/modifiers/addUser';
import removeVoiceUser from '../modifiers/removeVoiceUser';
import updateVoiceUser from '../modifiers/updateVoiceUser';
import addVoiceUser from '../modifiers/addVoiceUser';


export default function handleVoiceUsers({ header, body }) {
  const { voiceUsers } = body;
  const { meetingId } = header;

  const meeting = Meetings.findOne({ meetingId });
  const usersIds = voiceUsers.map(m => m.intId);

  const voiceUsersIdsToUpdate = VoiceUsers.find({
    meetingId,
    intId: { $in: usersIds },
  }).fetch().map(m => m.intId);

  const voiceUsersUpdated = [];
  voiceUsers.forEach((voice) => {
    if (voiceUsersIdsToUpdate.indexOf(voice.intId) >= 0) {
      // user already exist, then update
      voiceUsersUpdated.push(updateVoiceUser(meetingId, {
        intId: voice.intId,
        voiceUserId: voice.voiceUserId,
        talking: voice.talking,
        muted: voice.muted,
        voiceConf: meeting.voiceProp.voiceConf,
        joined: true,
      }));
    } else {
      // user doesn't exist yet, then add it
      addVoiceUser(meetingId, {
        voiceUserId: voice.voiceUserId,
        intId: voice.intId,
        callerName: voice.callerName,
        callerNum: voice.callerNum,
        muted: voice.muted,
        talking: voice.talking,
        callingWith: voice.callingWith,
        listenOnly: voice.listenOnly,
        voiceConf: meeting.voiceProp.voiceConf,
        joined: true,
      });

      const USER_CONFIG = Meteor.settings.public.user;
      const ROLE_VIEWER = USER_CONFIG.role_viewer;

      const voiceOnlyUser = { // web (Users) representation of dial-in user
        intId: voice.intId,
        extId: voice.intId, // TODO
        name: voice.callerName,
        role: ROLE_VIEWER.toLowerCase(),
        guest: false,
        authed: true,
        waitingForAcceptance: false,
        guestStatus: 'ALLOW',
        emoji: 'none',
        presenter: false,
        locked: false, // TODO
        avatar: '',
        clientType: 'dial-in-user',
      };

      addUser(meetingId, voiceOnlyUser);

    }
  });

  // removing extra users already existing in Mongo
  const voiceUsersToRemove = VoiceUsers.find({
    meetingId,
    intId: { $nin: usersIds },
  }).fetch();
  voiceUsersToRemove.forEach(user => removeVoiceUser(meetingId, {
    voiceConf: meeting.voiceProp.voiceConf,
    voiceUserId: user.voiceUserId,
    intId: user.intId,
  }));

  return voiceUsersUpdated;
}
