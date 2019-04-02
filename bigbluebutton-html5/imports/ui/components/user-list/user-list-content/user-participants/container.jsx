import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import UserParticipants from './component';

const UserParticipantsContainer = props => <UserParticipants {...props} />;

export default withTracker(({ getUsersId }) => ({
  meeting: Meetings.findOne({}),
  users: getUsersId(),
}))(UserParticipantsContainer);
