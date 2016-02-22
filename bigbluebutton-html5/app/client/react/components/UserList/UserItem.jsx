UserItem = React.createClass({
  statusicons(user){
    let statusIcons = [];

    if(this.props.currentUser.isModerator && this.props.currentUser.id !== user.id && !user.isPresenter){
      statusIcons.push((
        <Tooltip className="setPresenter" title={"set " + user.name + " as presenter"}>
          <Icon iconName="projection-screen" className="statusIcon"/>
        </Tooltip>
      ));
    }

    if(user.isPresenter){
      statusIcons.push((
        <Icon iconName="projection-screen" title={user.name + " is the presenter"} className="statusIcon"/>
      ));
    }
    else if(user.isModerator){
      statusIcons.push((
        <Icon iconName="torso" title={user.name +  " is a moderator"} className="statusIcon"/>
      ))
    }

    return (
      <div className="status">
        {statusIcons.map(i => i)}
      </div>
    );
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
