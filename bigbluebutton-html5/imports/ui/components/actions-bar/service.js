import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { makeCall } from '/imports/ui/services/api';
import VoiceUsers from '/imports/api/voice-users';

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
