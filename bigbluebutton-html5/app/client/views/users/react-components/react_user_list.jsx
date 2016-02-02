ReactUserList = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    return {
      users: Meteor.Users.find().fetch()
    };
  },

  render() {
    return (
        <div id="user-contents">
          <div className="userlist ScrollableWindowY">
            {this.data.users.map(function(user){
                return  <div key={user._id} id="content" className="userItem">
                          <ReactStatusIcon user={user} />
                          <span className="userNameEntry">
                            <span className="userName">{user.user.name}</span>
                          </span>
                          <div id="usericons">
                            <span rel="tooltip" data-placement="bottom" title={user.user.name + " is only listening"}>
                              <i className="icon fi-volume-none usericon"></i>
                            </span>
                          </div>
                        </div>
            })}
          </div>
        </div>
    );
  }
});
