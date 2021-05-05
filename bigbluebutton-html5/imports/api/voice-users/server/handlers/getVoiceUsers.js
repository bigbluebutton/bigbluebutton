import { check } from 'meteor/check';
import VoiceUsers from '/imports/api/voice-users/';
import Meetings from '/imports/api/meetings';
import addVoiceUser from '../modifiers/addVoiceUser';
import removeVoiceUser from '../modifiers/removeVoiceUser';
import updateVoiceUser from '../modifiers/updateVoiceUser';

export default function handleGetVoiceUsers({ body }, meetingId) {
  const { users } = body;

  check(meetingId, String);
  check(users, Array);

  const meeting = Meetings.findOne({ meetingId }, { fields: { 'voiceProp.voiceConf': 1 } });
  const usersIds = users.map(m => m.intId);

  const voiceUsersIdsToUpdate = VoiceUsers.find({
    meetingId,
    intId: { $in: usersIds },
  }, { fields: { intId: 1 } }).fetch().map(m => m.intId);

  users.forEach((user) => {
    if (voiceUsersIdsToUpdate.indexOf(user.intId) >= 0) {
      // user already exist, then update
      updateVoiceUser(meetingId, {
        intId: user.intId,
        voiceUserId: user.voiceUserId,
        talking: user.talking,
        muted: user.muted,
        voiceConf: meeting.voiceProp.voiceConf,
        joined: true,
      });
    } else {
      // user doesn't exist yet, then add it
      addVoiceUser(meetingId, {
        voiceUserId: user.voiceUserId,
        intId: user.intId,
        callerName: user.callerName,
        callerNum: user.callerNum,
        muted: user.muted,
        talking: user.talking,
        callingWith: user.callingWith,
        listenOnly: user.listenOnly,
        voiceConf: meeting.voiceProp.voiceConf,
        joined: true,
      });
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
}
