UserList UserListContainer = React.createClass({
  render() {
    return (
      <div className="userlist ScrollableWindowY">
        {this.props.users.map((user) => <UserItem key={user.id} user={user} currentUserModerator={this.props.currentUserModerator}/>)}
      </div>
    );
  }
})
