import {useSubscription, gql, useQuery} from '@apollo/client';
 import React, { useState } from "react";
import usePatchedSubscription from "./usePatchedSubscription";

export default function CursorsAll() {
  const { loading, error, data } = usePatchedSubscription(
    gql`subscription {
      pres_page_cursor(where: {isCurrentPage: {_eq: true}}) {
            isCurrentPage
            lastUpdatedAt
            meetingId
            pageId
            presentationId
            userId
            user {
                name
            }
            xPercent
            yPercent
      }
    }`
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
        <tr>
            <th colSpan="4">Private Chat Messages</th>
        </tr>
        <tr>
            <th>userId</th>
            <th>xPercent</th>
            <th>yPercent</th>
            <th>lastUpdatedAt</th>
        </tr>
      </thead>
      <tbody>
        {data.map((curr) => {
            console.log('cursor', curr);
          return (
              <tr key={curr.userId}>
                  {/*<td>{user.userId}</td>*/}
                  <td>{curr.user.name}</td>
                  <td>{curr.xPercent}</td>
                  <td>{curr.yPercent}</td>
                  <td>{curr.lastUpdatedAt}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

