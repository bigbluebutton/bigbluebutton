UserItem = React.createClass({
  statusicons(user) {
    if(user.isPresenter) {
      return (
        <div className="status">
          <span rel="tooltip" data-placement="bottom" title={user.name + " is the presenter"}>
            <i className="icon fi-projection-screen statusIcon"></i>
          </span>
        </div>
      )
    }
    else if(user.isModerator) {
      return (
        <div className="status">
          <span rel="tooltip" data-placement="bottom" title={user.name +  " is a moderatorabc"}>
            <i className="icon fi-torso statusIcon"></i>
          </span>
        </div>
      )
    }
    else if(this.props.currentUserModerator) {
      return (
        <div className="status">
          <span className="setPresenter" rel="tooltip" data-placement="bottom" title={"set " + user.name + " as presenter"}>
            <i className="icon fi-projection-screen statusIcon"></i>
          </span>
        </div>
      )
    }
    else {
      return (
        <div className="status">
        </div>
      )
    }
  },

  render() {
    const user = this.props.user;
    return (
      <div id="content" className="userItem">
        {this.statusicons(user)}
        {this.renderUserName(user)}
        {this.renderUnreadBadge(user.unreadMessagesCount)}
      </div>
    );
  },

  renderUserName(user) {
    let classes = ['usernameEntry'];
    let userName = user.name;

    if(user.isCurrent) {
      userName = userName.concat(' (you)');
      classes.push('userCurrent');
    }

    if(user.unreadMessagesCount) {
      classes.push('gotUnreadMail');
    }

    return (
      <Tooltip className={classNames(classes)} title={userName}>
        <span className="userName">{userName}</span>
      </Tooltip>
    );
  },

  renderUnreadBadge(unreadMessagesCount) {
    if(!unreadMessagesCount) {
      return;
    }

    return (
      <div className="unreadChatNumber">
        {(unreadMessagesCount > 9) ? '9+' : unreadMessagesCount }
      </div>
    );
  },

})
