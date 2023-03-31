import { useSubscription, gql } from '@apollo/client';
import React, { useState } from "react";

export default function TotalOfUsersTalking() {
  const { loading, error, data } = useSubscription(
      gql`subscription {
      user(where: {voices: {talking: {_eq: true}}}) {
        userId
      }
    }`
  );

    console.log('user talking', data);

    return  !loading && !error &&
        (<div>Users talking: { data?.user?.length } </div>);
}

