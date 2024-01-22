import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { useMutation } from '@apollo/client';
import GuestPolicyComponent from './component';
import Service from '../service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_POLICY } from '../mutations';

const GuestPolicyContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
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

  return amIModerator && <GuestPolicyComponent changeGuestPolicy={changeGuestPolicy} {...props} />;
};

export default withTracker(() => ({
  guestPolicy: Service.getGuestPolicy(),
}))(GuestPolicyContainer);
