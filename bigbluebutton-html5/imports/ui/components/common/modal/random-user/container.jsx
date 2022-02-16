import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import { makeCall } from '/imports/ui/services/api';
import RandomUserSelect from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import logger from '/imports/startup/client/logger';

const SELECT_RANDOM_USER_ENABLED = Meteor.settings.public.selectRandomUser.enabled;

//  A value that is used by component to remember
//  whether it should be open or closed after a render
let keepModalOpen = true;

//  A value that stores the previous indicator
let updateIndicator = 1;

const toggleKeepModalOpen = () => { keepModalOpen = ! keepModalOpen; };

const RandomUserSelectContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const { randomlySelectedUser } = props;

  let mappedRandomlySelectedUsers = [];

  const currentUser = {
    userId: Auth.userID,
    presenter: users[Auth.meetingID][Auth.userID].presenter
  };

  try {
    if (!currentUser.presenter //  this functionality does not bother presenter
      && (!keepModalOpen) //  we only ween a change if modal has been closed before
      && (randomlySelectedUser[0][1] !== updateIndicator)// if tey are different, a user was generated
    ) { keepModalOpen = true; } //  reopen modal
    if (!currentUser.presenter) { updateIndicator = randomlySelectedUser[0][1]; } // keep indicator up to date
  } catch (err) {
    logger.error({
      logCode: 'Random_USer_Error',
      extraInfo: {
        stackTrace: err,
      },
    },
    '\nIssue in Random User Select container caused by back-end crash'
      + '\nValue of 6 randomly selected users was passed as '
      + `{${randomlySelectedUser}}`
      + '\nHowever, it is handled.'
      + '\nError message:'
      + `\n${err}`);
  }

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

  return (
    <RandomUserSelect
      {...props}
      mappedRandomlySelectedUsers={mappedRandomlySelectedUsers}
      currentUser={currentUser}
      keepModalOpen={keepModalOpen}
    />
  );
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
