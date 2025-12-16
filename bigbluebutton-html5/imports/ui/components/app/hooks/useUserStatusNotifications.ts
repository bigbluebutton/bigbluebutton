import { useEffect, useRef } from 'react';
import { defineMessages, IntlShape } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import { RAISED_HAND_USERS } from '/imports/ui/core/graphql/queries/users';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { RaisedHandUser } from '/imports/ui/Types/user';

const intlMessages = defineMessages({
  raisedHand: {
    id: 'app.toast.setEmoji.raiseHand',
    description: 'toast message for raised hand notification',
  },
  raisedHandNext: {
    id: 'app.toast.raisedHandNext.label',
    description: 'message used when user is next to be called on',
  },
  loweredHand: {
    id: 'app.toast.setEmoji.lowerHand',
    description: 'toast message for lowered hand notification',
  },
  away: {
    id: 'app.toast.setEmoji.away',
    description: 'toast message for set away notification',
  },
  notAway: {
    id: 'app.toast.setEmoji.notAway',
    description: 'toast message for remove away notification',
  },
});

const useUserStatusNotifications = (
  currentUserAway?: boolean,
  currentUserRaiseHand?: boolean,
  intl?: IntlShape,
) => {
  const { data: currentUser } = useCurrentUser((user) => ({
    userId: user.userId,
    raiseHand: user.raiseHand,
  }));
  const { data: usersData } = useDeduplicatedSubscription<{ user: RaisedHandUser[] }>(RAISED_HAND_USERS);
  const isCurrentUserNextRaisedHand = usersData?.user && currentUser?.raiseHand
    ? usersData.user[0]?.userId === currentUser?.userId
    : false;
  const prevAwayRef = useRef<boolean | undefined>(currentUserAway);
  const prevRaiseHandRef = useRef<boolean | undefined>(currentUserRaiseHand);
  const prevRaisedHandNextRef = useRef<boolean | undefined>(isCurrentUserNextRaisedHand);

  useEffect(() => {
    if (intl && prevAwayRef.current !== currentUserAway) {
      if (currentUserAway === true) {
        notify(intl.formatMessage(intlMessages.away), 'info', 'user');
      } else if (currentUserAway === false) {
        notify(intl.formatMessage(intlMessages.notAway), 'info', 'clear_status');
      }
      prevAwayRef.current = currentUserAway;
    }
  }, [currentUserAway, intl]);

  useEffect(() => {
    if (intl && prevRaiseHandRef.current !== currentUserRaiseHand) {
      if (currentUserRaiseHand === true) {
        notify(intl.formatMessage(intlMessages.raisedHand), 'info', 'user');
      } else if (currentUserRaiseHand === false) {
        notify(intl.formatMessage(intlMessages.loweredHand), 'info', 'clear_status');
      }
      prevRaiseHandRef.current = currentUserRaiseHand;
    }
  }, [currentUserRaiseHand, intl]);

  useEffect(() => {
    if (intl && prevRaisedHandNextRef.current !== isCurrentUserNextRaisedHand) {
      if (isCurrentUserNextRaisedHand === true) {
        notify(intl.formatMessage(intlMessages.raisedHandNext), 'info', 'hand');
      }
      prevRaisedHandNextRef.current = isCurrentUserNextRaisedHand;
    }
  }, [isCurrentUserNextRaisedHand, intl]);
};

export default useUserStatusNotifications;
