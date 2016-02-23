UserItem = React.createClass({

  handleKick(user) {
    return user.actions.kick(user);
  },

  handleMuteUnmute(user) {
    return user.actions.mute(user);
  },

  handleOpenPrivateChat(user) {
    return user.actions.openChat(user)
  },

  handleSetPresenter(user){
    return user.actions.setPresenter(user);
  },

  render() {
    const user = this.props.user;
    return (
      <div id="content" className="userItem">
        {this.renderStatusIcons(user)}
        {this.renderUserName(user)}
        {this.renderUnreadBadge(user.unreadMessagesCount)}
        {this.renderSharingStatus(user)}
      </div>
    );
  },

  renderStatusIcons(user) {
    let statusIcons = [];

    if (this.props.currentUser.isModerator && !user.isPresenter) {
      statusIcons.push((
        <Tooltip key="1" onClick={this.handleSetPresenter.bind(this, user)} className="setPresenter" title={"set " + user.name + " as presenter"}>
          <Icon iconName="projection-screen" className="statusIcon"/>
        </Tooltip>
      ));
    }

    if (user.isPresenter) {
      statusIcons.push((<Icon key="2" iconName="projection-screen" title={user.name + " is the presenter"} className="statusIcon"/>));
    } else if (user.isModerator) {
      statusIcons.push((<Icon key="3" iconName="torso" title={user.name + " is a moderator"} className="statusIcon"/>))
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
      <Tooltip className={classNames(classes)} title={userName}>
        <Button componentClass="span" onClick={() => this.handleOpenPrivateChat(user)} className="userName">{userName} {user.sharingStatus.isInAudio}</Button>
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
  },

  renderSharingStatus(user) {
    const { sharingStatus, name: userName } = user;
    const currentUser = this.props.currentUser;

    let icons = [];

    if(sharingStatus.isInAudio){
      if(sharingStatus.isListenOnly) {
        icons.push(<Icon iconName="volume-none"
        title={`${userName} is only listening`} className="icon usericon"/>);
      }
      else{
        if(sharingStatus.isMuted) {
          if(user.id === currentUser.id){
            icons.push(
              <Button className="muteIcon"
                onClick={() => this.handleMuteUnmute(user)}
                componentClass="span">
                <Icon prependIconName="ion-" iconName="ios-mic-off"
                  title={`${userName} is muted`} className="icon usericon"/>
              </Button>
            );
          }
          else{
            icons.push(
              <Button componentClass="span">
                <Icon prependIconName="ion-" iconName="ios-mic-off"
                  title={`${userName} is muted`} className="icon usericon"/>
              </Button>
            );
          }
        }
        else{
          let talkingStatusIcon = <Icon prependIconName="ion-"
            iconName="ios-mic-outline" title={`${userName} is not talking`}
            className="icon usericon"/>;

          if(sharingStatus.isTalking) {
            talkingStatusIcon = <Icon prependIconName="ion-" iconName="ios-mic"
            title={`${userName} is talking`}
            className="icon usericon"/>;
          }

          if(user.id === currentUser.id){
            icons.push(
              <Button className="muteIcon"
                onClick={() => this.handleMuteUnmute(user)}
                componentClass="span">
                {talkingStatusIcon}
              </Button>
            );
          }
          else{
            icons.push(
              <Button componentClass="span">
                {talkingStatusIcon}
              </Button>
            );
          }
        }
      }
    }

    if (!user.isCurrent && currentUser.isModerator) {
      icons.push(
        <Button className="kickUser" onClick={() => this.handleKick(user)} componentClass="span">
          <Icon iconName="x-circle" title={`Kick ${userName}`} className="icon usericon"/>
        </Button>
      );
    }

    if (sharingStatus.isWebcamOpen) {
      icons.push(<Icon iconName="video" title={`${userName} is sharing their webcam`} className="icon usericon"/>);
    }

    if (sharingStatus.isLocked) {
      icons.push(<Icon iconName="lock" title={`${userName} is locked`} className="icon usericon"/>);
    }

    return (
      <div id="usericons">
        {icons.map(i => i)}
      </div>
    );
  }
})
