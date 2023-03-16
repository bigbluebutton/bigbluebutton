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
        userId
        name
        role
        color
        emoji
        avatar
        presenter
        pinned
        locked
        authed
        mobile
        clientType
        leftFlag
        loggedOut
        microphones {
          joined
          listenOnly
          talking
          muted
        }
        cameras {
          streamId
        }
        whiteboards {
          whiteboardId
        }
        breakoutRoom {
          isDefaultName
          sequence
          shortName
          online
        }
      }
    }`
  );

  return  !usersLoading && !usersError &&
    (<table border="1">
        <tr>
            {/*<th>Id</th>*/}
            <th>Name</th>
            <th>Role</th>
            <th>Emoji</th>
            <th>Avatar</th>
            <th>Presenter</th>
            <th>Mobile</th>
            <th>ClientType</th>
            <th>Sharing Camera</th>
            <th>Whiteboard Multiuser</th>
            <th>Pinned</th>
            <th>Sharing Mic</th>
            <th>ListenOnly</th>
            <th>Talking</th>
            <th>Muted</th>
            <th>Locked</th>
            <th>Last BreakoutRoom</th>
            <th>LeftFlag</th>
            <th>LoggedOut</th>
        </tr>

      {users.user.map((user) => {
          console.log('user', user);
        return (
            <tr key={user.userId} style={{ color: user.color }}>
                {/*<td>{user.userId}</td>*/}
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>{user.emoji}</td>
                <td>{user.avatar}</td>
                <td style={{backgroundColor: user.presenter === true ? '#A0DAA9' : ''}}>{user.presenter === true ? 'Yes' : 'No'}</td>
                <td style={{backgroundColor: user.mobile === true ? '#A0DAA9' : ''}}>{user.mobile === true ? 'Yes' : 'No'}</td>
                <td>{user.clientType}</td>
                <td style={{backgroundColor: user.cameras.length > 0 ? '#A0DAA9' : ''}}>{user.cameras.length > 0 ? 'Yes' : 'No'}</td>
                <td style={{backgroundColor: user.whiteboards.length > 0 ? '#A0DAA9' : ''}}>{user.whiteboards.length > 0 ? 'Yes' : 'No'}</td>
                <td style={{backgroundColor: user.pinned === true ? '#A0DAA9' : ''}}>{user.pinned === true ? 'Yes' : 'No'}</td>
                <td style={{backgroundColor: user.microphones.length > 0 ? '#A0DAA9' : ''}}>{user.microphones.length > 0 ? 'Yes' : 'No'}</td>
                <td style={{backgroundColor: user.microphones.filter(m => m.listenOnly === true).length > 0 ? '#A0DAA9' : ''}}>{user.microphones.filter(m => m.listenOnly === true).length > 0 ? 'Yes' : 'No'}</td>
                <td style={{backgroundColor: user.microphones.filter(m => m.talking === true).length > 0 ? '#A0DAA9' : ''}}>{user.microphones.filter(m => m.talking === true).length > 0 ? 'Yes' : 'No'}</td>
                <td style={{backgroundColor: user.microphones.filter(m => m.muted === true).length > 0 ? '#A0DAA9' : ''}}>{user.microphones.filter(m => m.muted === true).length > 0 ? 'Yes' : 'No'}</td>
                <td style={{backgroundColor: user.locked === true ? '#A0DAA9' : ''}}>{user.locked === true ? 'Yes' : 'No'}</td>
                <td style={{backgroundColor: user.breakoutRoom?.online === true ? '#A0DAA9' : ''}}>
                    {user.breakoutRoom?.shortName}{user.breakoutRoom?.online == true ? ' (Online)' : ''}
                </td>
                <td style={{backgroundColor: user.leftFlag === true ? '#A0DAA9' : ''}}>{user.leftFlag === true ? 'Yes' : 'No'}</td>
                <td style={{backgroundColor: user.loggedOut === true ? '#A0DAA9' : ''}}>{user.loggedOut === true ? 'Yes' : 'No'}</td>
            </tr>
        );
      })}
    </table>);
}

export default ParentOfWhoIsTalking;