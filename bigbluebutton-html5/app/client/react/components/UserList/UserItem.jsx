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
    return (
      <div id="content" className="userItem">
        {this.statusicons(this.props.user)}
        <span className="usernameEntry" rel="tooltip" data-placement="bottom" title={this.props.user.name}>
          <span className="userName">{this.props.user.name}</span>
        </span>
      </div>
    );
  }
})
