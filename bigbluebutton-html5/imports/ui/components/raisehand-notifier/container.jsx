import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Settings from '/imports/ui/services/settings';
import { useMutation } from '@apollo/client';
import RaiseHandNotifier from './component';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const ROLE_VIEWER = window.meetingClientSettings.public.user.role_viewer;

const StatusNotifierContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
    role: user.role,
  }));
  const isViewer = currentUserData?.role === ROLE_VIEWER;
  const isPresenter = currentUserData?.presenter;

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
