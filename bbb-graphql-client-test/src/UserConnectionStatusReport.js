import {gql, useMutation, useSubscription} from '@apollo/client';
import React, {useEffect} from "react";
import {applyPatch} from "fast-json-patch";

export default function UserConnectionStatusReport() {

  const { loading, error, data } = useSubscription(
    gql`subscription {
          user_connectionStatusReport {
            user {
              userId
              name
            }
            clientNotResponding
            lastUnstableStatus
            lastUnstableStatusAt
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
            <th>name</th>
            <th>clientNotResponding</th>
            <th>lastUnstableStatus</th>
            <th>lastUnstableStatusAt</th>
        </tr>
      </thead>
      <tbody>
        {data.user_connectionStatusReport.map((curr) => {
            console.log('user_connectionStatusReport', curr);
          return (
              <tr key={curr.user.userId}>
                  <td>{curr.user.name}</td>
                  <td>{curr.clientNotResponding ? 'True' : 'False'}</td>
                  <td>{curr.lastUnstableStatus}</td>
                  <td>{curr.lastUnstableStatusAt}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

