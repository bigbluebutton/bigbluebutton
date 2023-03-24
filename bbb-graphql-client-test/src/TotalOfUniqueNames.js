import { useSubscription, gql } from '@apollo/client';
import React, { useState } from "react";

export default function TotalOfUniqueNames() {
  const { loading: usersLoading, error: usersError, data: users } = useSubscription(
    gql`subscription {
      user_aggregate {
        aggregate {
          count(columns: name, distinct: true)
        }
      }
    }`
  );

    console.log('user', users);

  return  !usersLoading && !usersError &&
    (<div>Unique names: { users.user_aggregate.aggregate.count } </div>);
}

