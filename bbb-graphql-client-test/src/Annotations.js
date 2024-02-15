import {useSubscription, gql, useQuery} from '@apollo/client';
 import React, { useState } from "react";
import usePatchedSubscription from "./usePatchedSubscription";

export const CURRENT_PAGE_ANNOTATIONS_STREAM = gql`subscription annotationsStream($lastUpdatedAt: timestamptz){
  pres_annotation_curr_stream(batch_size: 10, cursor: {initial_value: {lastUpdatedAt: $lastUpdatedAt}}) {
    annotationId annotationInfo pageId
    presentationId
    userId
  }
}`;

export default function Annotations() {
    const lastUpdatedAt = "2023-03-29T20:26:29.002";

    const { loading, error, data } = useSubscription(
        CURRENT_PAGE_ANNOTATIONS_STREAM,
        {
            variables: { lastUpdatedAt },
        },
    );


  return  !loading && !error &&
    (<table border="1">
      <thead>
        <tr>
            <th colSpan="4">Annotations Stream (Full object)</th>
        </tr>
        <tr>
            <th>lastUpdatedAt</th>
            <th>annotationId</th>
            <th>annotationInfo</th>
        </tr>
      </thead>
        <tbody>
        {data.pres_annotation_curr_stream.map((curr) => {
            console.log('pres_annotation_curr_stream', curr);
          return (
              <tr key={curr.annotationId}>
                  {/*<td>{user.userId}</td>*/}
                  <td>{curr.lastUpdatedAt}</td>
                  <td>{curr.annotationId}</td>
                  <td>{curr.annotationInfo}</td>
              </tr>
          );
        })}
        </tbody>
    </table>);
}

