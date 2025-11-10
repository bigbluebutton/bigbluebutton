import React from 'react';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { RAISED_HAND_USERS, RaisedHandUsersSubscriptionResponse } from '/imports/ui/core/graphql/queries/users';
import RaiseHandNotifier from './component';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { User } from '/imports/ui/Types/user';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';

const RaiseHandNotifierContainer: React.FC = () => {
  const { data: currentUser } = useCurrentUser((user: Partial<User>) => ({
    isModerator: user?.isModerator ?? false,
    presenter: user?.presenter ?? false,
    userId: user?.userId ?? '',
  }));

  const {
    data: usersData,
    error: usersError,
  } = useDeduplicatedSubscription<RaisedHandUsersSubscriptionResponse>(RAISED_HAND_USERS);
  const raiseHandUsers = usersData?.user ?? [];

  if (usersError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error({
      logCode: 'raisehand_notifier_container_subscription_error',
      extraInfo: { usersError },
    }, 'Error on requesting raise hand data');
  }
  // @ts-ignore
  const { raiseHandAudioAlerts, raiseHandPushAlerts } = useSettings(SETTINGS.APPLICATION);
  if (!currentUser) return null;

  return (
    <RaiseHandNotifier
      raiseHandUsers={raiseHandUsers}
      raiseHandAudioAlert={!!raiseHandAudioAlerts}
      raiseHandPushAlert={!!raiseHandPushAlerts}
      isModerator={!!currentUser.isModerator}
      isPresenter={!!currentUser.presenter}
      currentUserId={currentUser.userId ?? ''}
    />
  );
};

export default RaiseHandNotifierContainer;
