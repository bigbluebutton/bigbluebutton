UserList = React.createClass({
  render() {
    return (
      <table className="user-list">
        <tbody>
          {this.props.users.map((user) => <UserItem key={user.id} user={user} currentUser={this.props.currentUser}/>)}
        </tbody>
      </table>
    );
  }
})
