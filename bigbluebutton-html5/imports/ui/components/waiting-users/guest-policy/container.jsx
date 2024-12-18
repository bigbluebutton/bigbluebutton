import React from 'react';
import { useMutation } from '@apollo/client';
import GuestPolicyComponent from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_POLICY } from '../mutations';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const GuestPolicyContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    usersPolicies: {
      guestPolicy: m.usersPolicies.guestPolicy,
    },
  }));

  const amIModerator = currentUserData?.isModerator;

  const [setPolicy] = useMutation(SET_POLICY);

  const changeGuestPolicy = (guestPolicy) => {
    setPolicy({
      variables: {
        guestPolicy,
      },
    });
  };

  return amIModerator
    && (
    <GuestPolicyComponent
      changeGuestPolicy={changeGuestPolicy}
      guestPolicy={currentMeeting?.usersPolicies.guestPolicy}
      {...props}
    />
    );
};

export default GuestPolicyContainer;
