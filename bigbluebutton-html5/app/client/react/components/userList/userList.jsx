UserList = React.createClass({
  render() {
    return (
      <div className="userlist ScrollableWindowY">
        {this.props.users.map((user) => <UserItem user={user}/>)}
      </div>
    );
  }
})
