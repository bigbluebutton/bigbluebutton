import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import UserParticipants from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const UserParticipantsContainer = props => <UserParticipants {...props} />;

export default withTracker(() => ({
  users: UserListService.getUsers(),
  meetingIsBreakout: meetingIsBreakout(),
}))(UserParticipantsContainer);
