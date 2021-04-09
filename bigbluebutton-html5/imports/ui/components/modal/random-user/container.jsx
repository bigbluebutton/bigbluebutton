import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import RandomUserSelect from './component';

const SELECT_RANDOM_USER_ENABLED = Meteor.settings.public.selectRandomUser.enabled;

const RandomUserSelectContainer = props => <RandomUserSelect {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => {
  const viewerPool = Users.find({
    meetingId: Auth.meetingID,
    presenter: { $ne: true },
    role: { $eq: 'VIEWER' },
  }, {
    fields: {
      userId: 1,
    },
  }).fetch();

  const meeting = Meetings.findOne({ meetingId: Auth.meetingID }, {
    fields: {
      randomlySelectedUser: 1,
    },
  });

  const selectedUser = Users.findOne({
    meetingId: Auth.meetingID,
    userId: meeting.randomlySelectedUser,
  }, {
    fields: {
      userId: 1,
      avatar: 1,
      color: 1,
      name: 1,
    },
  });

  const currentUser = Users.findOne(
    { userId: Auth.userID },
    { fields: { userId: 1, presenter: 1 } },
  );

  const randomUserReq = () => (SELECT_RANDOM_USER_ENABLED ? makeCall('setRandomUser') : null);

  const clearRandomlySelectedUser = () => (SELECT_RANDOM_USER_ENABLED ? makeCall('clearRandomlySelectedUser') : null);

  return ({
    closeModal: () => mountModal(null),
    numAvailableViewers: viewerPool.length,
    randomUserReq,
    selectedUser,
    currentUser,
    clearRandomlySelectedUser,
  });
})(RandomUserSelectContainer));
