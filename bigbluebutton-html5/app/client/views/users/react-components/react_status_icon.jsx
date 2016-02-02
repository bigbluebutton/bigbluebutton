ReactStatusIcon = React.createClass({
  getStatusIcon(user){
    console.log(user.user.presenter);
    if(user.user.presenter){
      return (
        <div className="status">
          <span rel="tooltip" data-placement="bottom" title={user.user.name + " is the presenter"}>
            <i className="icon fi-projection-screen statusIcon"></i>
          </span>
        </div>
      )
    }
    else if(user.user.role === "MODERATOR"){
      return (
        <div className="status">
          <span rel="tooltip" data-placement="bottom" title={user.user.name +  " is a moderatorabc"}>
            <i className="icon fi-torso statusIcon"></i>
          </span>
        </div>
      )
    }
    else{
      return (
        <div className="status">
          <span className="setPresenter" rel="tooltip" data-placement="bottom" title={"set " + user.user.name + " as presenter"}>
            <i className="icon fi-projection-screen statusIcon"></i>
          </span>
        </div>
      )
    }
  },

  render() {
    return (
      <span>
        {this.getStatusIcon(this.props.user)}
      </span>
    );
  }
});
