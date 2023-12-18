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
        userJoin(
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


  const { loading, error, data } = useSubscription(
    gql`subscription {
      user_current {
        userId
        name
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
            <th>joined</th>
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
                  <td>{curr.joined ? 'Yes' : 'No'}
                      {curr.joined ? '' : <button onClick={() => handleDispatchUserJoin(userAuthToken)}>Join Now!</button>}
                  </td>
                  <td>{curr.joinErrorCode}</td>
                  <td>{curr.joinErrorMessage}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

