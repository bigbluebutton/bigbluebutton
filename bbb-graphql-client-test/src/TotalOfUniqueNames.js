import { useSubscription, gql } from '@apollo/client';
import React, { useState } from "react";

export default function TotalOfUniqueNames() {
  const { loading, error, data } = useSubscription(
    gql`subscription {
      user_aggregate {
        aggregate {
          count(columns: name, distinct: true)
        }
      }
    }`
  );

    console.log('totalUnique', data);

  return  !loading && !error &&
    (<div>Unique names: { data.user_aggregate.aggregate.count } </div>);
}

