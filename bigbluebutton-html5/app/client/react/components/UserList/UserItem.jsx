UserItem = React.createClass({

  handleKick(user) {
    alert('Should kick user ' + user.name);
  },

  handleMute(user) {
    alert('Should mute user ' + user.name);
  },

  handleUnmute(user) {
    alert('Should unmute user ' + user.name);
  },

  statusicons(user) {
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
        {this.renderSharingStatus(user)}
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

  renderSharingStatus(user) {
    const { sharingStatus, name: userName } = user;

    let icons = [];

    if(sharingStatus.isListenOnly) {
      icons.push(<Icon iconName="fi-volume-none"
      title={`${userName} is only listening`} className="icon usericon"/>);
    } else {
      if(sharingStatus.isMuted) {
        icons.push(
          <Button className="muteIcon"
            onClick={() => this.handleMute(user)} componentClass="span">
            <Icon prependIconName="ion-" iconName="ios-mic-off"
              title={`${userName} is muted`} className="icon usericon"/>
          </Button>
        );
      } else {
        let talkingStatusIcon = <Icon prependIconName="ion-"
          iconName="ios-mic-outline" title={`${userName} is not talking`}
          className="icon usericon"/>;

        if(sharingStatus.isTalking) {
          talkingStatusIcon = <Icon prependIconName="ion-" iconName="ios-mic"
          title={`${userName} is talking`}
          className="icon usericon"/>;
        }

        icons.push(
          <Button className="muteIcon"
            onClick={() => this.handleUnmute(user)}
            componentClass="span">
            {talkingStatusIcon}
          </Button>
        );
      }
    }

    if (!user.isCurrent && user.isModerator) {
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
      <div className="sharing-status">
        {icons.map((icon, i) =>  {
          icon.prop.key = i;
          return icon;
        })}
      </div>
    );
  }

})
