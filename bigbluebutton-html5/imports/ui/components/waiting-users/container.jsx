import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users/';
import Meetings from '/imports/api/meetings';
import Service from './service';
import WaitingComponent from './component';
import { NLayoutContext } from '../layout/context/context';

const WaitingContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextDispatch } = newLayoutContext;
  return <WaitingComponent {...{ newLayoutContextDispatch, ...props }} />;
};

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

  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const { usersProp } = meeting;
  const { authenticatedGuest } = usersProp;

  return {
    guestUsers,
    authenticatedUsers,
    guestUsersCall: Service.guestUsersCall,
    changeGuestPolicy: Service.changeGuestPolicy,
    isGuestLobbyMessageEnabled: Service.isGuestLobbyMessageEnabled,
    setGuestLobbyMessage: Service.setGuestLobbyMessage,
    guestLobbyMessage: Service.getGuestLobbyMessage(),
    authenticatedGuest,
    allowRememberChoice: Service.allowRememberChoice,
  };
})(WaitingContainer);
