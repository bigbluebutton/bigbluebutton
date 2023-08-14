import {gql, useMutation, useQuery, useSubscription} from '@apollo/client';
import React from "react";

export default function MyInfo() {

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


  const { loading, error, data } = useSubscription(
    gql`subscription {
      user_current {
        userId
        name
        meeting {
            name
        }
        echoTestRunningAt
        isRunningEchoTest
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
            <th>Meeting</th>
            <th>echoTestRunningAt</th>
            <th>isRunningEchoTest</th>
        </tr>
      </thead>
      <tbody>
        {data.user_current.map((curr) => {
            console.log('meeting', curr);
          return (
              <tr key={curr.userId}>
                  <td>{curr.userId}</td>
                  <td>{curr.name}</td>
                  <td>{curr.meeting.name}</td>
                  <td>{curr.echoTestRunningAt}
                      <button onClick={() => handleUpdateUserEchoTestRunningAt()}>Set running now!</button>
                  </td>
                  <td>{curr.isRunningEchoTest ? 'Yes' : 'No'}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

