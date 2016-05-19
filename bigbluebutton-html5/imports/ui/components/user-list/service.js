import Users from '/imports/api/users';
import LocalStorage from '/imports/ui/services/storage';

let mapUsers = function() {
  Users.find().forEach(u => {
    console.log(u);
  })

  let currentUserID = LocalStorage.get('userID');
  let users = Users.find().map(u => {
    return {
      id: u.user.userid,
      name: u.user.name,
      isPresenter: u.user.presenter,
      isModerator: u.user.role === "MODERATOR",
      isCurrent: u.user.userid === currentUserID,
      isVoiceUser: u.user.voiceUser.joined,
      isListenOnly: u.user.listenOnly,
      isSharingWebcam: u.user.webcam_stream.length,
      // image: 'https://emoji.slack-edge.com/T04UJP9Q6/kappa/f95cc4610827c311.png'
    };
  })

  return {
    users: users

    // [
    //   {
    //     id: 1,
    //     name: 'Fred',
    //     isModerator: true,
    //     isPresenter: true
    //   }, {
    //     name: 'Richard',
    //     id: 2,
    //     isModerator: true,
    //     isCurrent: true
    //   }, {
    //     name: 'Tiago',
    //     id: 3,
    //     isPresenter: true,
    //     isVoiceUser: true
    //   }, {
    //     name: 'Felipe',
    //     id:4
    //   }
    // ]
  };
}

export default { mapUsers };
