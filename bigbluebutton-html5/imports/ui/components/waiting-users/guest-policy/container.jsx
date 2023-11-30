import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import GuestPolicyComponent from './component';
import Service from '../service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const GuestPolicyContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    role: user.role,
  }));
  const amIModerator = currentUserData?.role === ROLE_MODERATOR;

  return amIModerator && <GuestPolicyComponent {...props} />;
};

export default withTracker(() => ({
  guestPolicy: Service.getGuestPolicy(),
  changeGuestPolicy: Service.changeGuestPolicy,
}))(GuestPolicyContainer);
