import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/2.0/users';
import { makeCall } from '/imports/ui/services/api';
import VoiceUsers from '/imports/api/2.0/voice-users';

const isUserPresenter = () => Users.findOne({
  userId: Auth.userID,
}).presenter;

const toggleSelfVoice = () => makeCall('toggleSelfVoice');

const getVoiceUserData = () => {
  const userId = Auth.userID;
  const voiceUser = VoiceUsers.findOne({ intId: userId });

  const { muted, joined, talking, listenOnly } = voiceUser;

  return ({
    isInAudio: joined,
    isMuted: muted,
    isTalking: talking,
    listenOnly,
  });
};

export default {
  isUserPresenter,
  toggleSelfVoice,
  getVoiceUserData,
};
