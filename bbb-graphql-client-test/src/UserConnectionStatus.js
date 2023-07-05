import {gql, useMutation, useSubscription} from '@apollo/client';
import React, {useEffect} from "react";
import {applyPatch} from "fast-json-patch";

export default function UserConnectionStatus() {

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
    const [updateUserClientResponseAtToMeAsNow] = useMutation(gql`
      mutation UpdateConnectionAliveAt($userId: String, $userClientResponseAt: timestamp) {
        update_user_connectionStatus(
            where: {userClientResponseAt: {_is_null: true}}
            _set: { userClientResponseAt: "now()" }
          ) {
            affected_rows
          }
      }
    `);

    const handleUpdateUserClientResponseAt = () => {
        updateUserClientResponseAtToMeAsNow();
    };


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

    const handleUpdateConnectionAliveAt = () => {
        updateConnectionAliveAtToMeAsNow();

        setTimeout(() => {
            handleUpdateConnectionAliveAt();
        }, 5000);
    };

    useEffect(() => {
        handleUpdateConnectionAliveAt();
    }, []);



  const { loading, error, data } = useSubscription(
    gql`subscription {
      user_connectionStatus {
        connectionAliveAt
        userClientResponseAt
        rttInMs
        status
        statusUpdatedAt
      }
    }`
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
        <tr>
            <th colSpan={3}>Connection Status</th>
        </tr>
        <tr>
            {/*<th>Id</th>*/}
            <th>connectionAliveAt</th>
            <th>userClientResponseAt</th>
            <th>rttInMs</th>
            <th>status</th>
            <th>statusUpdatedAt</th>
        </tr>
      </thead>
      <tbody>
        {data.user_connectionStatus.map((curr) => {
            console.log('user_connectionStatus', curr);

            // if(curr.userClientResponseAt == null) {
            //     handleUpdateConnectionAliveAt();
            // }

            if(curr.userClientResponseAt == null) {
                console.log('entrou!');
                console.log('curr.connectionAliveAt',curr.connectionAliveAt);
                console.log('curr.userClientResponseAt',curr.userClientResponseAt);
                // handleUpdateUserClientResponseAt();
                const delay = 500;
                setTimeout(() => {
                    handleUpdateUserClientResponseAt();
                },delay);
            }

          return (
              <tr key={curr.connectionAliveAt}>
                  <td>{curr.connectionAliveAt}
                      <button onClick={() => handleUpdateConnectionAliveAt()}>Update now!</button>
                  </td>
                  <td>{curr.userClientResponseAt}</td>
                  <td>{curr.rttInMs}</td>
                  <td>{curr.status}</td>
                  <td>{curr.statusUpdatedAt}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

