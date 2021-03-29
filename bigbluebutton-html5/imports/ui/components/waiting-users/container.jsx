import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users/';
import Meetings from '/imports/api/meetings';
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

  const authenticatedGuest = Meetings.findOne({ meetingId: Auth.meetingID }).usersProp.authenticatedGuest;

  return {
    guestUsers,
    authenticatedUsers,
    guestUsersCall: Service.guestUsersCall,
    changeGuestPolicy: Service.changeGuestPolicy,
    isGuestLobbyMessageEnabled: Service.isGuestLobbyMessageEnabled,
    setGuestLobbyMessage: Service.setGuestLobbyMessage,
    guestLobbyMessage: Service.getGuestLobbyMessage(),
    authenticatedGuest,
  };
})(WaitingContainer);
