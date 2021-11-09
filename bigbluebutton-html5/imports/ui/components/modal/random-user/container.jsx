import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/ui/local-collections/meetings-collection/meetings';
import Auth from '/imports/ui/services/auth';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import RandomUserSelect from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import logger from '/imports/startup/client/logger';

const SELECT_RANDOM_USER_ENABLED = Meteor.settings.public.selectRandomUser.enabled;

const SELECT_RANDOM_USER_COUNTDOWN = Meteor.settings.public.selectRandomUser.countdown;

//  Time intervals in milliseconds
//  for iteration in animation.
const intervals = [0, 200, 450, 750, 1100, 1500];

//  A value that is used by component to remember
//  whether it should be open or closed after a render
let keepModalOpen = true;

const toggleKeepModalOpen = () => { keepModalOpen = !keepModalOpen; };

//  A value that stores the previous indicator
let prevUpdateIndicator = true;

let restartLimit = 5;

const RandomUserSelectContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  let { randomlySelectedUser } = props;

  let viewerPool = [];

  // Will contain an array with 6 values,
  // each contaiing an ID and delay in ms for animation
  // first 5 for animation and fifth chosen in akka-apps
  let userList = [];

  // Will contain visual data about those 6 users
  let mappedRandomlySelectedUsers = [];

  const currentUser = {
    userId: Auth.userID,
    presenter: users[Auth.meetingID][Auth.userID].presenter
  };

  // Populating viewerPool
  for (let meeting in users) {
    for (let id in users[meeting]) {
      if(users[meeting][id].role == 'VIEWER') viewerPool.push(id);
    }
  }

  if (!randomlySelectedUser.choice) { 
    if (currentUser.presenter && restartLimit !== 0) {
      makeCall('setRandomUser', false, false); // An innitial call
      restartLimit--;
      return null;
    } else {
      logger.error({
        logCode: 'Random_User_Select container.jsx',
        extraInfo: {
          callType: 'null'
        },
      }, 'Random_User_Select called with null');
      // Normally this error cannot occur,
      // but in case it does, returning nll will prevent crush
      return null;
    }
  }
  restartLimit = 5; // When everything works correctly we just set it to default value

  const { requesterId, updateIndicator } = randomlySelectedUser;
  const chosenUser = randomlySelectedUser.choice;

  if (!keepModalOpen //  we only get a change if modal has been closed before
    && (updateIndicator !== prevUpdateIndicator)// if tey are different, a user was generated
  ) { keepModalOpen = true; } //  reopen modal
  prevUpdateIndicator = updateIndicator; // keep indicator up to date

  userList = populateUserList(viewerPool, requesterId, chosenUser);

  mappedRandomlySelectedUsers = userList.map((ui) => {
    const selectedUser = users[Auth.meetingID][ui[0]];
    return [{
      userId: selectedUser.userId,
      avatar: selectedUser.avatar,
      color: selectedUser.color,
      name: selectedUser.name,
    }, ui[1]];
  });

  return (
    <RandomUserSelect
      {...props}
      mappedRandomlySelectedUsers={mappedRandomlySelectedUsers}
      currentUser={currentUser}
      keepModalOpen={keepModalOpen}
      numAvailableViewers={viewerPool.length}
    />
  );
};
export default withModalMounter(withTracker(({ mountModal }) => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID }, {
    fields: {
      randomlySelectedUser: 1,
    },
  });

  const randomUserReq = (allowRepeat, refresh) => (SELECT_RANDOM_USER_ENABLED ? makeCall('setRandomUser', allowRepeat, refresh) : null);

  const clearRandomlySelectedUser = () => (SELECT_RANDOM_USER_ENABLED ? makeCall('clearRandomlySelectedUser') : null);

  return ({
    closeModal: () => mountModal(null),
    toggleKeepModalOpen,
    randomUserReq,
    clearRandomlySelectedUser,
    randomlySelectedUser: meeting.randomlySelectedUser,
  });
})(RandomUserSelectContainer));

function setSixSameUsers(id) {
  return ([
    [id, 0], [id, 0], [id, 0],
    [id, 0], [id, 0], [id, 0],
  ]);
}

function populateUserList(viewerPool, requesterId, chosenUser) {
  let userList = [];
  // no viewer
  if (chosenUser === 'null') userList = setSixSameUsers(requesterId);

  //  If user is only one, obviously it is the chosen one
  else if (viewerPool.length === 1) userList = setSixSameUsers(viewerPool[0]);

  //  If animation is disabled, we only care about the chosen one
  else if (!SELECT_RANDOM_USER_COUNTDOWN) userList = setSixSameUsers(chosenUser);

  else { // We generate 5 users randomly, just for animation, and last one is the chosen one
    for (let i = 0; i < intervals.length - 1; i++) {
      const randomID = viewerPool[Math.floor(Math.random() * viewerPool.length)];
      userList.push([randomID, intervals[i]]);
    }
    userList.push([chosenUser, intervals[intervals.length -1 ]]);
  }
  return userList;
}
