import Users from '/imports/api/users';
import LocalStorage from '/imports/ui/services/storage';

let mapUsers = function() {
  let currentUserID = LocalStorage.get('userID');
  let users = Users.find().map(u => {
    return {
      id: u.user.userid,
      name: u.user.name,
      isPresenter: u.user.presenter,
      isModerator: u.user.role === "MODERATOR",
      isCurrent: u.user.userid === currentUserID,
      isVoiceUser: u.user.voiceUser.joined,
      isMuted: u.user.voiceUser.muted,
      isListenOnly: u.user.listenOnly,
      isSharingWebcam: u.user.webcam_stream.length
    };
  });

  return {
    users: users
  };
};

export default {
  mapUsers
};
