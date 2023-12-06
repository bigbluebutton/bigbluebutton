import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Settings from '/imports/ui/services/settings';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import { useMutation } from '@apollo/client';
import RaiseHandNotifier from './component';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

const StatusNotifierContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const isViewer = currentUser.role === ROLE_VIEWER;
  const isPresenter = currentUser.presenter;

  const [setRaiseHand] = useMutation(SET_RAISE_HAND);

  const lowerUserHands = (userId) => {
    setRaiseHand({
      variables: {
        userId,
        raiseHand: false,
      },
    });
  };

  return (
    <RaiseHandNotifier {...{
      ...props,
      isViewer,
      isPresenter,
      lowerUserHands,
    }}
    />
  );
};

export default withTracker(() => {
  const AppSettings = Settings.application;
  const raiseHandUsers = Users.find({
    meetingId: Auth.meetingID,
    raiseHand: true,
  }, {
    fields: {
      raiseHandTime: 1, raiseHand: 1, userId: 1, name: 1, color: 1, role: 1, avatar: 1,
    },
    sort: { raiseHandTime: 1 },
  }).fetch();

  return {
    raiseHandUsers,
    raiseHandAudioAlert: AppSettings.raiseHandAudioAlerts,
    raiseHandPushAlert: AppSettings.raiseHandPushAlerts,
  };
})(StatusNotifierContainer);
