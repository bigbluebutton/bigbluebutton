import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import GuestPolicyComponent from './component';
import Service from '../service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const GuestPolicyContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const amIModerator = currentUserData?.isModerator;

  return amIModerator && <GuestPolicyComponent {...props} />;
};

export default withTracker(() => ({
  guestPolicy: Service.getGuestPolicy(),
  changeGuestPolicy: Service.changeGuestPolicy,
}))(GuestPolicyContainer);
