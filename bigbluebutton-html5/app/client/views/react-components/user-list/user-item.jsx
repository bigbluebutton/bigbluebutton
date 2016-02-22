_UserItem = React.createClass({
  render() {
    let user = this.props.user;

    return (
      <div className="user-item">
        <UserStatus emoji={user.emoji}
            isPresenter={user.isPresenter}
            isModerator={user.isModerator}/>
        <UserName userName={user.name}/>
        <div class="unreadChatNumber">99</div>
        <UserMediaList status={user.sharingStatus}/>
        <UserActionList shouldDisplay={user.isModerator && !user.isCurrent}/>
      </div>
    );
  }
})
