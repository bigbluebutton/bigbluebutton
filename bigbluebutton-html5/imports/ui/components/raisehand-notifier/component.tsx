import React from 'react';
import AudioService from '/imports/ui/components/audio/service';

type RaiseHandNotifierProps = {
  raiseHandUsers: Array<{ userId: string }>;
  raiseHandAudioAlert: boolean;
  isModerator: boolean;
  isPresenter: boolean;
};

const getRaiseHandSoundUrl = () => {
  const { cdn, basename } = window.meetingClientSettings.public.app;
  return `${cdn + basename}/resources/sounds/bbb-handRaise.mp3`;
};

const RaiseHandNotifier: React.FC<RaiseHandNotifierProps> = ({
  raiseHandUsers,
  raiseHandAudioAlert,
  isModerator,
  isPresenter,
}) => {
  const previousUserIdsRef = React.useRef<string[] | null>(null);

  React.useEffect(() => {
    const currentUserIds = raiseHandUsers.map((user) => user.userId);

    if (previousUserIdsRef.current === null) {
      previousUserIdsRef.current = currentUserIds;
      return;
    }

    const isAllowed = raiseHandAudioAlert && (isModerator || isPresenter);

    if (isAllowed) {
      const previousUserIdsSet = new Set(previousUserIdsRef.current);
      const hasNewRaisedHand = currentUserIds.some((id) => !previousUserIdsSet.has(id));

      if (hasNewRaisedHand) {
        AudioService.playAlertSound(getRaiseHandSoundUrl());
      }
    }

    previousUserIdsRef.current = currentUserIds;
  }, [raiseHandUsers, raiseHandAudioAlert, isModerator, isPresenter]);

  return null;
};

export default RaiseHandNotifier;
