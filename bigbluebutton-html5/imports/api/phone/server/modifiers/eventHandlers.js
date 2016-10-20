import { eventEmitter } from '/imports/startup/server';
import { updateVoiceUser } from '/imports/api/users/server/modifiers/updateVoiceUser';

eventEmitter.on('user_left_voice_message', function (arg) {
  handleVoiceEvent(arg);
});

eventEmitter.on('user_joined_voice_message', function (arg) {
  handleVoiceEvent(arg);
});

eventEmitter.on('user_voice_talking_message', function (arg) {
  handleVoiceEvent(arg);
});

eventEmitter.on('user_voice_muted_message', function (arg) {
  handleVoiceEvent(arg);
});

eventEmitter.on('user_listening_only', function (arg) {
  const voiceUserObj = {
    web_userid: arg.payload.userid,
    listen_only: arg.payload.listen_only,
  };
  const meetingId = arg.payload.meeting_id;
  return updateVoiceUser(meetingId, voiceUserObj, arg.callback);
});

const handleVoiceEvent = function (arg) {
  const meetingId = arg.payload.meeting_id;
  const voiceUser = arg.payload.user.voiceUser;
  const voiceUserObj = {
    web_userid: voiceUser.web_userid,
    listen_only: arg.payload.listen_only,
    talking: voiceUser.talking,
    joined: voiceUser.joined,
    locked: voiceUser.locked,
    muted: voiceUser.muted,
  };
  return updateVoiceUser(meetingId, voiceUserObj, arg.callback);
};
