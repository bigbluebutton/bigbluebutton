import { useSubscription, gql } from '@apollo/client';
 import React, { useState } from "react";

export default function TotalOfUsers() {
  const { loading, error, data } = useSubscription(
    gql`subscription {
      user_aggregate {
            aggregate {
              count
            }
          }
    }`
  );

    console.log('totalUsers', data);

  return  !loading && !error &&
    (<div>Total of users: { data.user_aggregate.aggregate.count } </div>);
}
