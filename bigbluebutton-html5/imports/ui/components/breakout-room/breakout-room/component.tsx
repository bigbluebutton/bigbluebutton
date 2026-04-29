import React, {
  useCallback,
  useEffect,
} from 'react';
import {
  GetBreakoutDataResponse,
  getBreakoutData,
} from './queries';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutDispatch } from '../../layout/context';
import { ACTIONS, PANELS } from '../../layout/enums';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import SidebarCreateBreakoutContainer from '../create-breakout-room/sidebar-create-breakout/container';
import RunningBreakoutRoom from './running-room/component';
import ParticipantBreakoutRoom from './participant-room/component';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';

const BreakoutRoomContainer: React.FC = () => {
  const layoutContextDispatch = layoutDispatch();
  const {
    data: meetingData,
  } = useMeeting((m) => ({
    audioBridge: m.audioBridge,
    durationInSeconds: m.durationInSeconds,
    createdTime: m.createdTime,
    meetingId: m.meetingId,
    isBreakout: m.isBreakout,
    componentsFlags: m.componentsFlags,
  }));

  const {
    data: currentUserData,
    loading: currentUserLoading,
  } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
    presenter: u.presenter,
    voice: u.voice,
    userId: u.userId,
  }));

  const closePanel = useCallback(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  }, [layoutContextDispatch]);

  const hasBreakoutRoom = meetingData?.componentsFlags?.hasBreakoutRoom ?? false;
  const prevHasBreakoutRoom = usePreviousValue(hasBreakoutRoom);

  useEffect(() => {
    if (prevHasBreakoutRoom && !hasBreakoutRoom) {
      closePanel();
    }
  }, [hasBreakoutRoom, prevHasBreakoutRoom, closePanel]);

  const {
    data: breakoutData,
    loading: breakoutLoading,
    error: breakoutError,
  } = useDeduplicatedSubscription<GetBreakoutDataResponse>(getBreakoutData);

  if (
    breakoutLoading
    || currentUserLoading
  ) return null;

  if (breakoutError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: breakoutError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }
  if (!currentUserData || !breakoutData || !meetingData) return null; // or loading spinner or error

  const isBreakoutMeeting = meetingData?.isBreakout ?? false;

  if (!hasBreakoutRoom && (currentUserData.isModerator ?? false) && !isBreakoutMeeting) {
    return (
      <SidebarCreateBreakoutContainer
        setIsOpen={(value: boolean) => {
          if (!value) {
            closePanel();
          }
        }}
      />
    );
  }

  if (hasBreakoutRoom && (currentUserData.isModerator ?? false) && !isBreakoutMeeting) {
    return (
      <RunningBreakoutRoom
        breakouts={breakoutData.breakoutRoom || []}
        userId={currentUserData.userId ?? ''}
        meetingId={meetingData.meetingId ?? ''}
        closePanel={closePanel}
      />
    );
  }

  if (isBreakoutMeeting) {
    return (
      <ParticipantBreakoutRoom
        breakouts={[]}
        meetingId={meetingData.meetingId ?? ''}
        presenter={currentUserData.presenter ?? false}
        userJoinedAudio={(currentUserData?.voice?.joined && !currentUserData?.voice?.deafened) ?? false}
        closePanel={closePanel}
        isInBreakout
        breakoutMeetingId={meetingData.meetingId ?? ''}
      />
    );
  }

  return (
    <ParticipantBreakoutRoom
      breakouts={breakoutData.breakoutRoom || []}
      meetingId={meetingData.meetingId ?? ''}
      presenter={currentUserData.presenter ?? false}
      userJoinedAudio={(currentUserData?.voice?.joined && !currentUserData?.voice?.deafened) ?? false}
      closePanel={closePanel}
    />
  );
};

export default BreakoutRoomContainer;
