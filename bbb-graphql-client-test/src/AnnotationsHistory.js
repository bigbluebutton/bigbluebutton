import {useSubscription, gql, useQuery} from '@apollo/client';
 import React, { useState } from "react";

export default function AnnotationsHistory() {
  const { loading, error, data } = useSubscription(
    gql`subscription {
          pres_annotation_history_curr_stream(batch_size: 10, cursor: {initial_value: {sequence: 0}}) {
            annotationId
            annotationInfo
            meetingId
            pageId
            presentationId
            sequence
            userId
          }
        }
        `
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
        <tr>
            <th colSpan="4">Annotations (Stream only DIFF)</th>
        </tr>
        <tr>
            <th>annotationId</th>
            <th>annotationInfo</th>
            <th>sequence</th>
        </tr>
      </thead>
      <tbody>
        {data.pres_annotation_history_curr_stream.map((curr) => {
            console.log('pres_annotation_history_curr_stream', curr);
          return (
              <tr key={curr.sequence}>
                  {/*<td>{user.userId}</td>*/}
                  <td>{curr.annotationId}</td>
                  <td>{curr.annotationInfo}</td>
                  <td>{curr.sequence}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

