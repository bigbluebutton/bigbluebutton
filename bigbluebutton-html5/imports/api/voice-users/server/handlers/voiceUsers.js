import VoiceUsers from '/imports/api/voice-users/';
import Meetings from '/imports/api/meetings';
import addDialInUser from '/imports/api/users/server/modifiers/addDialInUser';
import removeVoiceUser from '../modifiers/removeVoiceUser';
import updateVoiceUser from '../modifiers/updateVoiceUser';
import addVoiceUser from '../modifiers/addVoiceUser';


export default function handleVoiceUsers({ header, body }) {
  const { voiceUsers } = body;
  const { meetingId } = header;

  const meeting = Meetings.findOne({ meetingId }, { fields: { 'voiceProp.voiceConf': 1 } });
  const usersIds = voiceUsers.map(m => m.intId);

  const voiceUsersIdsToUpdate = VoiceUsers.find({
    meetingId,
    intId: { $in: usersIds },
  }, { fields: { intId: 1 } }).fetch().map(m => m.intId);

  voiceUsers.forEach((voice) => {
    if (voiceUsersIdsToUpdate.indexOf(voice.intId) >= 0) {
      // user already exist, then update
      updateVoiceUser(meetingId, {
        intId: voice.intId,
        voiceUserId: voice.voiceUserId,
        talking: voice.talking,
        muted: voice.muted,
        voiceConf: meeting.voiceProp.voiceConf,
        joined: true,
      });
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

      addDialInUser(meetingId, voice);
    }
  });

  // removing extra users already existing in Mongo
  const voiceUsersToRemove = VoiceUsers.find({
    meetingId,
    intId: { $nin: usersIds },
  }, { fields: { voiceUserId: 1, intId: 1 } }).fetch();
  voiceUsersToRemove.forEach(user => removeVoiceUser(meetingId, {
    voiceConf: meeting.voiceProp.voiceConf,
    voiceUserId: user.voiceUserId,
    intId: user.intId,
  }));
}
