import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/ui/local-collections/meetings-collection/meetings';
import Users from '/imports/ui/local-collections/users-collection/users';
import Auth from '/imports/ui/services/auth';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import RandomUserSelect from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const SELECT_RANDOM_USER_ENABLED = Meteor.settings.public.selectRandomUser.enabled;

let keepModalOpen = true;

let updateIndicator = 1;

const toggleKeepModalOpen = () => { keepModalOpen = ! keepModalOpen; }

const RandomUserSelectContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const { randomlySelectedUser } = props;

  let mappedRandomlySelectedUsers = [];

  const currentUser = { userId: Auth.userID, presenter: users[Auth.meetingID][Auth.userID].presenter };

  if(!currentUser.presenter &&
    (keepModalOpen == false) &&
    (randomlySelectedUser[0][1] != updateIndicator)
    ){ keepModalOpen = true; }

  if(!currentUser.presenter){ updateIndicator = randomlySelectedUser[0][1]; }

  if (randomlySelectedUser) {
    mappedRandomlySelectedUsers = randomlySelectedUser.map((ui) => {
      const selectedUser = users[Auth.meetingID][ui[0]];
      return [{
        userId: selectedUser.userId,
        avatar: selectedUser.avatar,
        color: selectedUser.color,
        name: selectedUser.name,
      }, ui[1]];
    });
  }

  return <RandomUserSelect
  {...props}
  mappedRandomlySelectedUsers={mappedRandomlySelectedUsers}
  currentUser={currentUser}
  keepModalOpen={keepModalOpen}
  />;
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

  const meeting = Meetings.findOne({ meetingId: Auth.meetingID }, {
    fields: {
      randomlySelectedUser: 1,
    },
  });

  const randomUserReq = () => (SELECT_RANDOM_USER_ENABLED ? makeCall('setRandomUser') : null);

  const clearRandomlySelectedUser = () => (SELECT_RANDOM_USER_ENABLED ? makeCall('clearRandomlySelectedUser') : null);

  return ({
    closeModal: () => mountModal(null),
    toggleKeepModalOpen,
    numAvailableViewers: viewerPool.length,
    randomUserReq,
    clearRandomlySelectedUser,
    randomlySelectedUser: meeting.randomlySelectedUser,
  });
})(RandomUserSelectContainer));
