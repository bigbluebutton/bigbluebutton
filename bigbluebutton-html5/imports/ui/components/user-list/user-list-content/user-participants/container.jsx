import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import UserListService from '/imports/ui/components/user-list/service';
import UserParticipants from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { formatNumber } from '/imports/utils/intl-formatter';

const UserParticipantsContainer = props => <UserParticipants {...props} />;

export default withTracker(() => ({
  meeting: Meetings.findOne({}),
  users: UserListService.getUsers(),
  meetingIsBreakout: meetingIsBreakout(),
  formatNumber,
}))(UserParticipantsContainer);
