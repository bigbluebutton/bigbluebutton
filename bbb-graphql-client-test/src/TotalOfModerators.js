import { useSubscription, gql } from '@apollo/client';
import React, { useState } from "react";


export default function TotalOfModerators() {
  const { loading: usersLoading, error: usersError, data: users } = useSubscription(
    gql`subscription {
      user_aggregate(where: {role: {_eq: "MODERATOR"}}) {
        aggregate {
          count
        }
      }
    }`
  );

    console.log('user colors', users);

    return  !usersLoading && !usersError &&
        (<div>Moderators: { users.user_aggregate.aggregate.count } </div>);
}

