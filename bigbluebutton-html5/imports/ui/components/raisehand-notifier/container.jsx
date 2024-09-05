import React from 'react';
import { useMutation } from '@apollo/client';
import RaiseHandNotifier from './component';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { RAISED_HAND_USERS } from './queries';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';

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
  } = useDeduplicatedSubscription(RAISED_HAND_USERS);
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

  const {
    raiseHandAudioAlerts,
    raiseHandPushAlerts,
  } = useSettings(SETTINGS.APPLICATION);

  return (
    <RaiseHandNotifier {...{
      ...props,
      raiseHandAudioAlert: raiseHandAudioAlerts,
      raiseHandPushAlert: raiseHandPushAlerts,
      isViewer,
      isPresenter,
      lowerUserHands,
      raiseHandUsers,
    }}
    />
  );
};

export default StatusNotifierContainer;
