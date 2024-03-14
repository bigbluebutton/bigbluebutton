import {gql, useMutation, useSubscription} from '@apollo/client';
import React from "react";

export default function MyInfo({userAuthToken}) {

    //where is not necessary once user can update only its own status
    //Hasura accepts "now()" as value to timestamp fields
    const [updateUserClientEchoTestRunningAtMeAsNow] = useMutation(gql`
      mutation UpdateUserClientEchoTestRunningAt {
        update_user_current(
            where: {}
            _set: { echoTestRunningAt: "now()" }
          ) {
            affected_rows
          }
      }
    `);

    const handleUpdateUserEchoTestRunningAt = () => {
        updateUserClientEchoTestRunningAtMeAsNow();
    };

    const [dispatchUserJoin] = useMutation(gql`
      mutation UserJoin($authToken: String!, $clientType: String!) {
        userJoinMeeting(
          authToken: $authToken,
          clientType: $clientType,
        )
      }
    `);

    const handleDispatchUserJoin = (authToken) => {
        dispatchUserJoin({
            variables: {
                authToken: authToken,
                clientType: 'HTML5',
            },
        });
    };

    const [dispatchUserLeave] = useMutation(gql`
      mutation UserLeaveMeeting {
        userLeaveMeeting
      }
    `);
    const handleDispatchUserLeave = (authToken) => {
        dispatchUserLeave();
    };


  const { loading, error, data } = useSubscription(
    gql`subscription {
      user_current {
        userId
        name
        loggedOut
        ejected
        joined
        joinErrorCode
        joinErrorMessage
      }
    }`
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
        <tr>
            <th colSpan={3}>My info</th>
        </tr>
        <tr>
            {/*<th>Id</th>*/}
            <th>userId</th>
            <th>name</th>
            <th>Status</th>
            <th>joinErrorCode</th>
            <th>joinErrorMessage</th>
        </tr>
      </thead>
      <tbody>
        {data.user_current.map((curr) => {
            console.log('user_current', curr);
          return (
              <tr key={curr.userId}>
                  <td>{curr.userId}</td>
                  <td>{curr.name}</td>
                  <td>{curr.joined && !curr.loggedOut && !curr.ejected ? 'joined' : ''}
                      {curr.loggedOut ? 'loggedOut' : ''}
                      {curr.ejected ? 'ejected' : ''}
                      {!curr.joined && !curr.loggedOut ? <button onClick={() => handleDispatchUserJoin(userAuthToken)}>Join Now!</button> : ''}
                      {curr.joined && !curr.loggedOut && !curr.ejected ? <button onClick={() => handleDispatchUserLeave()}>Leave Now!</button> : ''}
                  </td>
                  <td>{curr.joinErrorCode}</td>
                  <td>{curr.joinErrorMessage}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

