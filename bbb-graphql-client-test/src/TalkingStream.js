import {useSubscription, gql, useQuery} from '@apollo/client';
 import React, { useState } from "react";

export default function TalkingStream() {
  const { loading, error, data } = useSubscription(
    gql`subscription {
          user_voice_stream(batch_size: 10, cursor: {initial_value: {lastSpeakChangedAt: 0}}) {
            talking
            startTime
            endTime
            muted
            talking
            userId
            user {
              name
            }
          }
        }
        `
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
        <tr>
            <th colSpan="4">Talking Stream</th>
        </tr>
        <tr>
            <th>userId</th>
            <th>Talking</th>
            <th>Muted</th>
        </tr>
      </thead>
      <tbody>
        {data.user_voice_stream.map((curr) => {
            console.log('cursor_stream', curr);
          return (
              <tr key={curr.userId}>
                  {/*<td>{user.userId}</td>*/}
                  <td>{curr.user.name}</td>
                  <td>{curr.talking == true ? 'Yes' : 'No'}</td>
                  <td>{curr.muted == true ? 'Yes' : 'No'}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

