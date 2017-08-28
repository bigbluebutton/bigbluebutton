import Auth from '/imports/ui/services/auth';
import VoiceUsers from '/imports/api/2.0/voice-users';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

const mapUser = (user) => {
  const userId = Auth.userID;
  const voiceUser = VoiceUsers.findOne({ intId: user.userId });
  const { muted, talking, listenOnly } = voiceUser;

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
    isVoiceUser: listenOnly || talking,
    isMuted: muted,
    isTalking: talking,
    isListenOnly: listenOnly,
    isSharingWebcam: 0,
    isPhoneUser: user.phone_user,
    isOnline: user.connectionStatus === 'online',
    isLocked: user.locked,
  };

  return mappedUser;
};

export default mapUser;
