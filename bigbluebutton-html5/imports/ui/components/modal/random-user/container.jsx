import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import RandomUserSelect from './component';

const RandomUserSelectContainer = props => <RandomUserSelect {...props} />;

export default withModalMounter(withTracker(({ mountModal, isSelectedUser }) => {
  const randomUserPool = Users.find({
    meetingId: Auth.meetingID,
    presenter: { $ne: true },
    connectionStatus: 'online',
    role: { $eq: 'VIEWER' },
  }, {
    fields: {
      userId: 1,
      avatar: 1,
      color: 1,
      name: 1,
    },
  }).fetch();

  const getRandomUser = () => {
    const { length } = randomUserPool;
    const randomIndex = Math.floor(Math.random() * Math.floor(length));
    return length > 0 ? randomUserPool[randomIndex] : null;
  };

  const getActiveRandomUser = () => {
    const meeting = Meetings.findOne({ meetingId: Auth.meetingID }, {
      fields: {
        randomlySelectedUser: 1,
      },
    });

    return Users.findOne({
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
  };

  const setRandomUser = userId => makeCall('setRandomUser', userId);

  return ({
    closeModal: () => mountModal(null),
    getRandomUser,
    numAvailableViewers: randomUserPool.length,
    setRandomUser,
    getActiveRandomUser,
    isSelectedUser,
  });
})(RandomUserSelectContainer));
