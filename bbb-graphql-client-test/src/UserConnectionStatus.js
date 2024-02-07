import {gql, useMutation, useSubscription} from '@apollo/client';
import React, {useEffect, useState, useRef } from "react";
import {applyPatch} from "fast-json-patch";

export default function UserConnectionStatus() {
    const networkRttInMs = useRef(null); // Ref to store the current timeout
    const lastStatusUpdatedAtReceived = useRef(null); // Ref to store the current timeout

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


    const timeoutRef = useRef(null); // Ref to store the current timeout



    //where is not necessary once user can update only its own status
    //Hasura accepts "now()" as value to timestamp fields
    const [updateUserClientResponseAtToMeAsNow] = useMutation(gql`
      mutation UpdateConnectionClientResponse($networkRttInMs: numeric) {
        update_user_connectionStatus(
            where: {userClientResponseAt: {_is_null: true}}
            _set: { 
                userClientResponseAt: "now()",
                networkRttInMs: $networkRttInMs
             }
          ) {
            affected_rows
          }
      }
    `);

    const handleUpdateUserClientResponseAt = () => {
        updateUserClientResponseAtToMeAsNow({
            variables: {
                networkRttInMs: networkRttInMs.current
            },
        });
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
        const startTime = performance.now();

        try {
            updateConnectionAliveAtToMeAsNow().then(result => {
                const endTime = performance.now();
                networkRttInMs.current = endTime - startTime;

            });
        } catch (error) {
            console.error('Error performing mutation:', error);
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
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
        applicationRttInMs
        networkRttInMs
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
            <th>applicationRttInMs</th>
            <th>networkRttInMs</th>
            <th>status</th>
            <th>statusUpdatedAt</th>
        </tr>
      </thead>
      <tbody>
        {data.user_connectionStatus.map((curr) => {
            // console.log('user_connectionStatus', curr);

            console.log('curr.statusUpdatedAt',curr.statusUpdatedAt);
            console.log('lastStatusUpdatedAtReceived.current',lastStatusUpdatedAtReceived.current);

            if(curr.userClientResponseAt == null
                && (curr.statusUpdatedAt == null || curr.statusUpdatedAt !== lastStatusUpdatedAtReceived.current)) {



                lastStatusUpdatedAtReceived.current = curr.statusUpdatedAt;
                // setLastStatusUpdatedAtReceived(curr.statusUpdatedAt);
                handleUpdateUserClientResponseAt();
            }

          return (
              <tr key={curr.connectionAliveAt}>
                  <td>{curr.connectionAliveAt}
                      <button onClick={() => handleUpdateConnectionAliveAt()}>Update now!</button>
                  </td>
                  <td>{curr.userClientResponseAt}</td>
                  <td>{curr.applicationRttInMs}</td>
                  <td>{curr.networkRttInMs}</td>
                  <td>{curr.status}</td>
                  <td>{curr.statusUpdatedAt}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

