import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users/';
import Service from './service';
import WaitingComponent from './component';

class WaitingContainer extends PureComponent {
  render() {
    return (
      <WaitingComponent {...this.props} />
    );
  }
}

export default withTracker(() => {
  const guestUsers = GuestUsers.find({
    meetingId: Auth.meetingID,
    guest: true,
    approved: false,
    denied: false,
  }).fetch();


  const authenticatedUsers = GuestUsers.find({
    meetingId: Auth.meetingID,
    authenticated: true,
    guest: false,
    approved: false,
    denied: false,
  }).fetch();

  return {
    guestUsers,
    authenticatedUsers,
    guestUsersCall: Service.guestUsersCall,
    changeGuestPolicy: Service.changeGuestPolicy,
  };
})(WaitingContainer);
