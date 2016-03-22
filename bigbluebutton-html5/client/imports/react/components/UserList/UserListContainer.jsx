import {UserList} from './UserList.jsx';
import {mapUsers} from './UserListService.js';

export let UserListContainer = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    return mapUsers();
  },

  render() {
    return (
      <UserList users={this.data.users} currentUser={this.data.currentUser}/>
    );
  },
});;
