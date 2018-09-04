import Auth from '/imports/ui/services/auth';
import VoiceUsers from '/imports/api/voice-users';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

const getVoiceUser = userId => VoiceUsers.findOne({ intId: userId });

const mapUser = (user) => {
  const userId = Auth.userID;
  const voiceUser = getVoiceUser(user.userId);

  const mappedUser = {
    id: user.userId,
    name: user.name,
    color: user.color,
    avatar: user.avatar,
    emoji: {
      status: user.emoji,
      changedAt: user.emojiTime,
    },
    isPresenter: user.presenter,
    isModerator: user.role === ROLE_MODERATOR,
    isCurrent: user.userId === userId,
    isVoiceUser: voiceUser ? voiceUser.joined : false,
    isMuted: voiceUser ? voiceUser.muted : false,
    isTalking: voiceUser ? voiceUser.talking && !voiceUser.muted : false,
    isListenOnly: voiceUser ? voiceUser.listenOnly : false,
    isSharingWebcam: user.has_stream,
    isPhoneUser: user.phone_user,
    isOnline: user.connectionStatus === 'online',
    clientType: user.clientType,
  };

  mappedUser.isLocked = user.locked && !(mappedUser.isPresenter || mappedUser.isModerator);

  return mappedUser;
};

export default mapUser;
