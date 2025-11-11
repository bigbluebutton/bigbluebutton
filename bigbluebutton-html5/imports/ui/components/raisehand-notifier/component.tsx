import React, { useRef, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import AudioService from '/imports/ui/components/audio/service';
import { notify } from '/imports/ui/services/notification';
import { RaisedHandUser } from '/imports/ui/core/graphql/queries/users';

type RaiseHandNotifierProps = {
  raiseHandUsers: RaisedHandUser[];
  raiseHandAudioAlert: boolean;
  raiseHandPushAlert: boolean;
  isModerator: boolean;
  isPresenter: boolean;
  currentUserId: string;
};

const intlMessages = defineMessages({
  raisedHandSingle: {
    id: 'app.statusNotifier.raisedHandDescOneUser',
    description: 'Label for a single user with raised hand',
  },
  raisedHandMultiple: {
    id: 'app.statusNotifier.raisedHandDesc',
    description: 'Label for multiple users with raised hand',
  },
});

const RaiseHandNotifier: React.FC<RaiseHandNotifierProps> = ({
  raiseHandUsers,
  raiseHandAudioAlert,
  raiseHandPushAlert,
  isModerator,
  isPresenter,
  currentUserId,
}) => {
  const intl = useIntl();
  const previousUserIdsRef = useRef<string[] | null>(null);

  const getRaiseHandSoundUrl = () => {
    const { cdn, basename } = window.meetingClientSettings.public.app;
    return `${cdn + basename}/resources/sounds/bbb-handRaise.mp3`;
  };

  const buildRaisedHandMessage = (names: string[]) => {
    if (names.length === 0) return null;

    const formattedNames = names.join(', ');

    if (names.length === 1) {
      return intl.formatMessage(intlMessages.raisedHandSingle, { userNames: formattedNames });
    }

    return intl.formatMessage(intlMessages.raisedHandMultiple, { userNames: formattedNames });
  };

  useEffect(() => {
    const currentUserIds = raiseHandUsers.map((user) => user.userId);

    if (previousUserIdsRef.current === null) {
      previousUserIdsRef.current = currentUserIds;
      return;
    }

    const previousUserIdsSet = new Set(previousUserIdsRef.current);
    const newRaisedHandUsers = raiseHandUsers.filter(
      (user) => !previousUserIdsSet.has(user.userId),
    ).filter((user) => isPresenter && user.userId !== currentUserId);
    const hasNewRaisedHand = newRaisedHandUsers.length > 0;
    const isAllowed = isModerator || isPresenter;

    if (hasNewRaisedHand && isAllowed) {
      if (raiseHandAudioAlert) {
        AudioService.playAlertSound(getRaiseHandSoundUrl());
      }

      if (raiseHandPushAlert) {
        const nonCurrentUser = newRaisedHandUsers
          .filter((user) => user.userId !== currentUserId);
        const names = nonCurrentUser
          .map((user) => user.name)
          .filter((name): name is string => !!name && name.length > 0);
        const message = buildRaisedHandMessage(names);

        if (message) {
          notify(message, 'info', 'hand');
        }
      }
    }

    previousUserIdsRef.current = currentUserIds;
  }, [
    intl,
    isModerator,
    isPresenter,
    raiseHandAudioAlert,
    raiseHandPushAlert,
    raiseHandUsers,
  ]);

  return null;
};

export default RaiseHandNotifier;
