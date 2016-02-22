UserItem = React.createClass({
  statusicons(user){
    if(user.isPresenter){
      return (
        <div className="status">
          <span rel="tooltip" data-placement="bottom" title={user.name + " is the presenter"}>
            <i className="icon fi-projection-screen statusIcon"></i>
          </span>
        </div>
      )
    }
    else if(user.isModerator){
      return (
        <div className="status">
          <span rel="tooltip" data-placement="bottom" title={user.name +  " is a moderatorabc"}>
            <i className="icon fi-torso statusIcon"></i>
          </span>
        </div>
      )
    }
    else{
      return (
        <div className="status">
          <span className="setPresenter" rel="tooltip" data-placement="bottom" title={"set " + user.name + " as presenter"}>
            <i className="icon fi-projection-screen statusIcon"></i>
          </span>
        </div>
      )
    }
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
