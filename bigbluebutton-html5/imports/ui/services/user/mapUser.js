import Auth from '/imports/ui/services/auth';
import VoiceUsers from '/imports/api/2.0/voice-users';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

const mapUser = (user) => {
  const userId = Auth.userID;
  const voiceUser = VoiceUsers.findOne({ intId: userId });
  const { muted, joined, talking, listenOnly } = voiceUser;

  const mapedUser = {
    id: user.userid,
    name: user.name,
    emoji: {
      status: user.emoji,
      changedAt: user.set_emoji_time,
    },
    isPresenter: user.presenter,
    isModerator: user.role === ROLE_MODERATOR,
    isCurrent: user.userid === userId,
    isVoiceUser: joined,
    isMuted: muted,
    isTalking: talking,
    isListenOnly: listenOnly,
    isSharingWebcam: 0,
    isPhoneUser: user.phone_user,
    isOnline: user.connection_status === 'online',
    isLocked: user.locked,
  };

  return mapedUser;
};

export default mapUser;
