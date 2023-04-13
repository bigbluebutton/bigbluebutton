import {useSubscription, gql, useMutation} from '@apollo/client';
 import React, { useState } from "react";

const ParentOfUserList = ({userId}) => {
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
      {shouldRender && <UserList userId={userId} />}
    </div>
  );
}

function UserList({userId}) {

    //example specifying where and time (new Date().toISOString())
    //but its not necessary
    // const [updateConnectionAliveAt] = useMutation(gql`
    //   mutation UpdateConnectionAliveAt($userId: String, $connectionAliveAt: timestamp) {
    //     update_user_connectionStatus(
    //         where: { userId: { _eq: $userId } },
    //         _set: { connectionAliveAt: $connectionAliveAt }
    //       ) {
    //         affected_rows
    //       }
    //   }
    // `);

    //where is not necessary once user can update only its own status
    //Hasura accepts "now()" as value to timestamp fields
    const [updateConnectionAliveAtToMeAsNow] = useMutation(gql`
      mutation UpdateConnectionAliveAt($userId: String, $connectionAliveAt: timestamp) {
        update_user_connectionStatus(
            where: {},
            _set: { connectionAliveAt: "now()" }
          ) {
            affected_rows
          }
      }
    `);

    const handleUpdateConnectionAliveAt = (userId) => {
        // updateConnectionAliveAt({
        //     variables: {
        //         userId,
        //         connectionAliveAt: new Date().toISOString()
        //     },
        // });

        updateConnectionAliveAtToMeAsNow();
    };

  const { loading, error, data } = useSubscription(
    gql`subscription {
      user(limit: 200, order_by: {name: asc}) {
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
        voice {
          joined
          listenOnly
          talking
          muted
        }
        cameras {
          streamId
        }
        presPagesWritable(where: {isCurrentPage: {_eq: true}}) {
          pageId
          isCurrentPage
        }
        lastBreakoutRoom {
          isDefaultName
          sequence
          shortName
          currentlyInRoom
        }
        connectionStatus {
            connectionAliveAt
        }
      }
    }`
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
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
            <th>connectionAliveAt</th>
            <th>LeftFlag</th>
            <th>LoggedOut</th>
        </tr>
      </thead>
      <tbody>
        {data.user.map((user) => {
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
                  <td style={{backgroundColor: user.presPagesWritable.length > 0 ? '#A0DAA9' : ''}}>{user.presPagesWritable.length > 0 ? 'Yes' : 'No'}</td>
                  <td style={{backgroundColor: user.pinned === true ? '#A0DAA9' : ''}}>{user.pinned === true ? 'Yes' : 'No'}</td>
                  <td style={{backgroundColor: user.voice?.joined === true ? '#A0DAA9' : ''}}>{user.voice?.joined === true ? 'Yes' : 'No'}</td>
                  <td style={{backgroundColor: user.voice?.listenOnly === true ? '#A0DAA9' : ''}}>{user.voice?.listenOnly === true ? 'Yes' : 'No'}</td>
                  <td style={{backgroundColor: user.voice?.talking === true ? '#A0DAA9' : ''}}>{user.voice?.talking === true ? 'Yes' : 'No'}</td>
                  <td style={{backgroundColor: user.voice?.muted === true ? '#A0DAA9' : ''}}>{user.voice?.muted === true ? 'Yes' : 'No'}</td>
                  <td style={{backgroundColor: user.locked === true ? '#A0DAA9' : ''}}>{user.locked === true ? 'Yes' : 'No'}</td>
                  <td style={{backgroundColor: user.lastBreakoutRoom?.currentlyInRoom === true ? '#A0DAA9' : ''}}>
                      {user.lastBreakoutRoom?.shortName}{user.lastBreakoutRoom?.currentlyInRoom === true ? ' (Online)' : ''}
                  </td>
                  <td>
                      {user?.connectionStatus?.connectionAliveAt}
                      <br />
                      { user?.userId === userId ? <button onClick={() => handleUpdateConnectionAliveAt(user.userId)}>Update now!</button>
                       : ''
                      }
                  </td>
                  <td style={{backgroundColor: user.leftFlag === true ? '#A0DAA9' : ''}}>{user.leftFlag === true ? 'Yes' : 'No'}</td>
                  <td style={{backgroundColor: user.loggedOut === true ? '#A0DAA9' : ''}}>{user.loggedOut === true ? 'Yes' : 'No'}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

export default ParentOfUserList;
