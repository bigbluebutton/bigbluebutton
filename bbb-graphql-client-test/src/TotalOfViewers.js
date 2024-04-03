import { useSubscription, gql } from '@apollo/client';
import React, { useState } from "react";

export default function TotalOfViewers() {
  const { loading, error, data } = useSubscription(
      gql`subscription {
      user_aggregate(where: {role: {_eq: "VIEWER"}}) {
        aggregate {
          count
        }
      }
    }`
  );

    console.log('user colors', data);

    return  !loading && !error &&
        (<div>Viewers: { data.user_aggregate.aggregate.count } </div>);
}

