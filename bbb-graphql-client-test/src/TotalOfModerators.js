import { useSubscription, gql } from '@apollo/client';
import React, { useState } from "react";


export default function TotalOfModerators() {
  const { loading, error, data } = useSubscription(
    gql`subscription {
      user_aggregate(where: {role: {_eq: "MODERATOR"}}) {
        aggregate {
          count
        }
      }
    }`
  );

    console.log('user colors', data);

    return  !loading && !error &&
        (<div>Moderators: { data.user_aggregate.aggregate.count } </div>);
}

