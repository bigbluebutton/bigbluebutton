UserItem = React.createClass({
  openPrivateChat(user) {
    let userIdSelected = user.id;

    if (userIdSelected !== null) {
      if (userIdSelected === this.props.currentUser.id) {
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
  },

  setPresenter(user){
    /*this is a global function and should be looked at to be changed to a better solution*/
    setUserPresenter(BBB.getMeetingId(), user.id, getInSession('userId'), user.name, getInSession('authToken'));
  },

  render() {
    const user = this.props.user;
    return (
      <div id="content" className="userItem">
        {this.renderStatusIcons(user)}
        {this.renderUserName(user)}
        {this.renderUnreadBadge(user.unreadMessagesCount)}
      </div>
    );
  },

  renderStatusIcons(user) {
    let statusIcons = [];

    if (this.props.currentUser.isModerator && !user.isPresenter) {
      statusIcons.push((
        <Tooltip onClick={this.setPresenter.bind(this, user)} className="setPresenter" title={"set " + user.name + " as presenter"}>
          <Icon iconName="projection-screen" className="statusIcon"/>
        </Tooltip>
      ));
    }

    if (user.isPresenter) {
      statusIcons.push((<Icon iconName="projection-screen" title={user.name + " is the presenter"} className="statusIcon"/>));
    } else if (user.isModerator) {
      statusIcons.push((<Icon iconName="torso" title={user.name + " is a moderator"} className="statusIcon"/>))
    }

    return (
      <div className="status">
        {statusIcons.map(i => i)}
      </div>
    );
  },

  renderUserName(user) {
    let classes = ['usernameEntry'];
    let userName = user.name;

    if (user.isCurrent) {
      userName = userName.concat(' (you)');
      classes.push('userCurrent');
    }

    if (user.unreadMessagesCount) {
      classes.push('gotUnreadMail');
    }

    return (
      <Tooltip onClick={this.openPrivateChat.bind(this, user)} className={classNames(classes)} title={userName}>
        <span className="userName">{userName}</span>
      </Tooltip>
    );
  },

  renderUnreadBadge(unreadMessagesCount) {
    if (!unreadMessagesCount) {
      return;
    }

    return (
      <div className="unreadChatNumber">
        {(unreadMessagesCount > 9) ? '9+' : unreadMessagesCount}
      </div>
    );
  }
})
