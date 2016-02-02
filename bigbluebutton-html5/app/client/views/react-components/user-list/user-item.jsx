UserItem = React.createClass({
  render() {
    return (
      <div className="user-item">
        <UserStatus/>
        <UserName user={this.props.user} />
        <UserMediaList/>
        <UserActionList />
      </div>
    );
  }
})
