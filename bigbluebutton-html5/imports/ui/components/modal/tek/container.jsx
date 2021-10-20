import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { withModalMounter } from '/imports/ui/components/modal/service';
import TekSelect from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const TekSelectContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = { userId: Auth.userID, presenter: users[Auth.meetingID][Auth.userID].presenter };
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });

  return <TekSelect {...props} currentUser={currentUser} meeting={meeting} />;
};
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

  return ({
    closeModal: () => mountModal(null),
    numAvailableViewers: viewerPool.length,
  });
})(TekSelectContainer));
