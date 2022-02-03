import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users';
import Meetings from '/imports/api/meetings';
import Service from './service';
import WaitingComponent from './component';
import { layoutDispatch } from '../layout/context';

const WaitingContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();

  return <WaitingComponent {...{ layoutContextDispatch, ...props }} />;
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
    privateMessageVisible: Service.privateMessageVisible,
    guestUsersCall: Service.guestUsersCall,
    isWaitingRoomEnabled: Service.isWaitingRoomEnabled(),
    changeGuestPolicy: Service.changeGuestPolicy,
    isGuestLobbyMessageEnabled: Service.isGuestLobbyMessageEnabled,
    setGuestLobbyMessage: Service.setGuestLobbyMessage,
    guestLobbyMessage: Service.getGuestLobbyMessage(),
    privateGuestLobbyMessage: Service.getPrivateGuestLobbyMessage,
    setPrivateGuestLobbyMessage: Service.setPrivateGuestLobbyMessage,
    authenticatedGuest,
    allowRememberChoice: Service.allowRememberChoice,
  };
})(WaitingContainer);
