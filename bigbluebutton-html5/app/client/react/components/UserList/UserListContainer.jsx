UserListContainer = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    const currentUser = BBB.getCurrentUser();
    const isCurrentUserModerator = currentUser.user.role === "MODERATOR";
    const currentUserId = currentUser.userId;

    const chats = getInSession('chats');

    let users = Meteor.Users.find().fetch().map(u => u.user).map(u => {
      let user = {
        id: u.userid,
        name: u.name,
        isCurrent: u.userid === currentUserId,
        isPresenter: u.presenter,
        isModerator: u.role === "MODERATOR",
        emoji: u.emoji_status,
        sharingStatus: {
          isLocked: false, //TODO: Migrate blaze logic
          isWebcamOpen: u.webcam_stream.length,
          isListenOnly: u.listenOnly,
          isMuted: u.voiceUser.muted,
          isTalking: u.voiceUser.talking
        },
        actions: {
          kick(user) {
            kickUser(BBB.getMeetingId(), user.id, getInSession("userId"), getInSession("authToken"))
          },
          setPresenter(user) {
            setUserPresenter(BBB.getMeetingId(), user.id, getInSession('userId'), user.name, getInSession('authToken'));
          },
          openChat(user) {
            let userIdSelected = user.id;

            if (userIdSelected !== null) {
              if (userIdSelected === currentUserId) {
                setInSession("inChatWith", "PUBLIC_CHAT");
              } else {
                setInSession("inChatWith", userIdSelected);
              }
            }
            if (isPortrait() || isPortraitMobile()) {
              toggleUserlistMenu();
              toggleShield();
            }
            return setTimeout(() => { // waits until the end of execution queue
              return $("#newMessageInput").focus();
            }, 0);
          }
        },
        unreadMessagesCount: 0
      };

      chats.forEach(c => {
        let key = c.userId;

        // show unread count for public chat on the user itself
        if(user.isCurrent) {
          key = "PUBLIC_CHAT";
        }

        if(c.gotMail && c.userId === user.id) {
          user.unreadMessagesCount = c.number;
        }
      });

      return user;
    });

    return {
      // All this mapping should be on a service and not on the component itself
      currentUser: users.find(u => u.isCurrent),
      users: users
    };
  },

  render() {
    return (
      <div id="users" className="component">
        <h3 className="meetingTitle">DEMO</h3>
        <div id="user-contents">
          <UserList users={this.data.users} currentUser={this.data.currentUser}/>
        </div>
      </div>
    );
  }
})
