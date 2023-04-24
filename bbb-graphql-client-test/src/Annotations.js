import {useSubscription, gql, useQuery} from '@apollo/client';
 import React, { useState } from "react";

export default function Annotations() {
  const { loading, error, data } = useSubscription(
    gql`subscription {
          pres_annotation_curr_stream(batch_size: 10, cursor: {initial_value: {lastUpdatedAt: "\\"2023-03-29T20:26:29.002\\""}}) {
            annotationId
            annotationInfo
            lastUpdatedAt
            meetingId
            pageId
            presentationId
            userId
          }
        }
        `
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
        <tr>
            <th colSpan="4">Annotations Stream (Full object)</th>
        </tr>
        <tr>
            <th>annotationId</th>
            <th>annotationInfo</th>
            <th>lastUpdatedAt</th>
        </tr>
      </thead>
      <tbody>
        {data.pres_annotation_curr_stream.map((curr) => {
            console.log('pres_annotation_curr_stream', curr);
          return (
              <tr key={curr.annotationId}>
                  {/*<td>{user.userId}</td>*/}
                  <td>{curr.annotationId}</td>
                  <td>{curr.annotationInfo}</td>
                  <td>{curr.lastUpdatedAt}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

