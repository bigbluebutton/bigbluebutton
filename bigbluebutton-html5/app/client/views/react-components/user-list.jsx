UserList = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    return {
      users: Meteor.Users.find().fetch()
    };
  },

  render() {
    return (
      <div className="user-list ScrollableWindowY">
        {this.data.users.map(function(user) {
          return <UserItem user={user}/>
        })}
      </div>
    );
  }
})
