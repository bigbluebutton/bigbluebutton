import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import UserParticipants from './component';
import { isMeetingBreakout } from '/imports/ui/components/app/service';

const UserParticipantsContainer = props => <UserParticipants {...props} />;


export default withTracker(props => ({

  users: UserListService.getUsersByMeeting(props.meetingIdentifier),
  meetingIsBreakout: isMeetingBreakout(props.meetingIdentifier),
}))(UserParticipantsContainer);
