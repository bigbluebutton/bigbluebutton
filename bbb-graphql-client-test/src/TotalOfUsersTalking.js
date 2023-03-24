import { useSubscription, gql } from '@apollo/client';
import React, { useState } from "react";

export default function TotalOfUsersTalking() {
  const { loading: usersLoading, error: usersError, data: users } = useSubscription(
      gql`subscription {
      user(where: {voices: {talking: {_eq: true}}}) {
        userId
      }
    }`
  );

    console.log('user talking', users);

    return  !usersLoading && !usersError &&
        (<div>Users talking: { users?.user?.length } </div>);
}

