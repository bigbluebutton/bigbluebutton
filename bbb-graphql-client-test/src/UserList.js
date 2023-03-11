import { useSubscription, gql } from '@apollo/client';
 import React, { useState } from "react";

const ParentOfWhoIsTalking = () => {
  const [shouldRender, setShouldRender] = useState(true);
  return (
    <div>
      Userlist:
      <input type="checkbox" id="users" name="" value="users" checked={shouldRender} onChange={
        (e) => {
          console.log(e.target.checked);
          setShouldRender(e.target.checked);
        }
      }></input>
      {shouldRender && <UserList />}
    </div>
  );
}

function UserList() {
  const { loading: usersLoading, error: usersError, data: users } = useSubscription(
    gql`subscription {
      user(where: {joined: {_eq: true}}, order_by: {name: asc}) {
        name
        userId
        authed
        microphones {
          talking
        }
        cameras {
          streamId
        }
      }
    }`
  );

  return  !usersLoading && !usersError &&
    (<div>
      {users.user.map((user) => {
          console.log('user', user);
        return (
          <div>
            <ul>
              <li>{user.userId}</li>
              <li>{user.name}</li>
              <li>Talking: {user.microphones.filter(m => m.talking === true).length > 0 ? 'Yes' : 'No'}</li>
              <li>Sharing Mic: {user.microphones.length > 0 ? 'Yes' : 'No'}</li>
              <li>Sharing Camera: {user.cameras.length > 0 ? 'Yes' : 'No'}</li>
            </ul>
            <br/>
          </div>
        );
      })}
    </div>);
}

export default ParentOfWhoIsTalking;