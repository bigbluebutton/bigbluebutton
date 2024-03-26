import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import RandomUserSelect from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useMutation } from '@apollo/client';
import { PICK_RANDOM_VIEWER } from '/imports/ui/core/graphql/mutations/userMutations';

const SELECT_RANDOM_USER_ENABLED = window.meetingClientSettings.public.selectRandomUser.enabled;

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
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));

  const [pickRandomViewer] = useMutation(PICK_RANDOM_VIEWER);

  const randomUserReq = () => (SELECT_RANDOM_USER_ENABLED ? pickRandomViewer() : null);

  if (!users || !currentUserData) return null;

  let mappedRandomlySelectedUsers = [];

  const currentUser = {
    userId: Auth.userID,
    presenter: currentUserData?.presenter,
  };

  try {
    if (!currentUser.presenter //  this functionality does not bother presenter
      && (!keepModalOpen) //  we only ween a change if modal has been closed before
      && (randomlySelectedUser[0][1] !== updateIndicator)// if they are different, a user was generated
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
      if (selectedUser){
        return [{
          userId: selectedUser.userId,
          avatar: selectedUser.avatar,
          color: selectedUser.color,
          name: selectedUser.name,
        }, ui[1]];
      }
    });
  }

  return (
    <RandomUserSelect
      {...props}
      mappedRandomlySelectedUsers={mappedRandomlySelectedUsers}
      currentUser={currentUser}
      keepModalOpen={keepModalOpen}
      randomUserReq={randomUserReq}
    />
  );
};
export default withTracker(() => {
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

  const clearRandomlySelectedUser = () => (SELECT_RANDOM_USER_ENABLED ? makeCall('clearRandomlySelectedUser') : null);

  return ({
    toggleKeepModalOpen,
    numAvailableViewers: viewerPool.length,
    clearRandomlySelectedUser,
    randomlySelectedUser: meeting.randomlySelectedUser,
  });
})(RandomUserSelectContainer);
