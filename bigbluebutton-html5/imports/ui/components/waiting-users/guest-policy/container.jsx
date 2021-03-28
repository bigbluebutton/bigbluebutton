import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import GuestPolicyComponent from './component';
import Service from '../service';

const guestPolicyContainer = props => <GuestPolicyComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => mountModal(null),
  guestPolicy: Service.getGuestPolicy(),
  changeGuestPolicy: Service.changeGuestPolicy,
}))(guestPolicyContainer));
