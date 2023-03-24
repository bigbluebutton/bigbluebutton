import { useSubscription, gql } from '@apollo/client';
 import React, { useState } from "react";

export default function TotalOfUsers() {
  const { loading: usersLoading, error: usersError, data: users } = useSubscription(
    gql`subscription {
      user_aggregate {
            aggregate {
              count
            }
          }
    }`
  );

    console.log('user', users);

  return  !usersLoading && !usersError &&
    (<div>Total of users: { users.user_aggregate.aggregate.count } </div>);
}
