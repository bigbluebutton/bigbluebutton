import { useSubscription, gql } from '@apollo/client';
import React, { useState } from "react";

export default function TotalOfViewers() {
  const { loading: usersLoading, error: usersError, data: users } = useSubscription(
      gql`subscription {
      user_aggregate(where: {role: {_eq: "VIEWER"}}) {
        aggregate {
          count
        }
      }
    }`
  );

    console.log('user colors', users);

    return  !usersLoading && !usersError &&
        (<div>Viewers: { users.user_aggregate.aggregate.count } </div>);
}

