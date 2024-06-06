import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import { useMutation, useSubscription } from '@apollo/client';
import RaiseHandNotifier from './component';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { RAISED_HAND_USERS } from './queries';
import logger from '/imports/startup/client/logger';

const StatusNotifierContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
    isModerator: user.isModerator,
  }));
  const isViewer = !currentUserData?.isModerator;
  const isPresenter = currentUserData?.presenter;

  const {
    data: usersData,
    error: usersError,
  } = useSubscription(RAISED_HAND_USERS);
  const raiseHandUsers = usersData?.user || [];

  if (usersError) {
    logger.error({
      logCode: 'raisehand_notifier_container_subscription_error',
      extraInfo: { usersError },
    }, 'Error on requesting raise hand data');
  }

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
      raiseHandUsers,
    }}
    />
  );
};

export default withTracker(() => {
  const AppSettings = Settings.application;

  return {
    raiseHandAudioAlert: AppSettings.raiseHandAudioAlerts,
    raiseHandPushAlert: AppSettings.raiseHandPushAlerts,
  };
})(StatusNotifierContainer);
