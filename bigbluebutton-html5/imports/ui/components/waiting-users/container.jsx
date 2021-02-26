import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users/';
import Meetings from '/imports/api/meetings';
import Service from './service';
import WaitingComponent from './component';
import NewLayoutContext from '../layout/context/context';

const WaitingContainer = (props) => {
  const { newLayoutContextState, ...rest } = props;
  return <WaitingComponent {...rest} />;
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
    authenticatedGuest,
  };
})(NewLayoutContext.withConsumer(WaitingContainer));
