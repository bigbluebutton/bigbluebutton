_UserList = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    const currentUserId = BBB.getCurrentUser().userId;

    return {
      // All this mapping should be on a service and not on the component itself
      users: Meteor.Users.find()
        .fetch()
        .map(u => u.user)
        .map(u => {
          return {
            name: u.name,
            isCurrent: u.userid === currentUserId,
            isPresenter: u.presenter,
            isModerator: u.role === "MODERATOR",
            emoji: u.emoji_status,
            sharingStatus: {
              isLocked: true, //TODO: Migrate blaze logic
              isWebcamOpen: u.webcam_stream.length,
              isListenOnly: u.listenOnly,
              isMuted: u.voiceUser.muted,
              isTalking: u.voiceUser.talking,
            }
          };
        })
    };
  },

  render() {
    return (
      <div className="user-list">
        {this.data.users.map((user) => <UserItem user={user}/>)}
      </div>
    );
  }
})
