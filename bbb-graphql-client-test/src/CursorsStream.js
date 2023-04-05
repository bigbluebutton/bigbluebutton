import {useSubscription, gql, useQuery} from '@apollo/client';
 import React, { useState } from "react";

export default function CursorsStream() {
  const { loading, error, data } = useSubscription(
    gql`subscription {
          pres_page_cursor_stream(batch_size: 10, cursor: {initial_value: {lastUpdatedAt: "\\"2023-03-29T20:26:29.002\\""}}) {
            isCurrentPage
            lastUpdatedAt
            meetingId
            pageId
            presentationId
            userId
            xPercent
            yPercent
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
            <th colSpan="4">Cursors Stream</th>
        </tr>
        <tr>
            <th>userId</th>
            <th>xPercent</th>
            <th>yPercent</th>
        </tr>
      </thead>
      <tbody>
        {data.pres_page_cursor_stream.map((curr) => {
            console.log('cursor_stream', curr);
          return (
              <tr key={curr.userId}>
                  {/*<td>{user.userId}</td>*/}
                  <td>{curr.user.name}</td>
                  <td>{curr.xPercent}</td>
                  <td>{curr.yPercent}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

