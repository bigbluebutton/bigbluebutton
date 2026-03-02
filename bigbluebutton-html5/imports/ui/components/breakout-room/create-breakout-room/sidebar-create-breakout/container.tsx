import React, { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { useIntl } from 'react-intl';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { filterByMeetingId } from '/imports/ui/core/utils/subscriptionFilters';
import {
  getUser,
  getUserResponse,
  getMeetingGroup,
  getMeetingGroupResponse,
} from '../queries';
import { PRESENTATIONS_SUBSCRIPTION, PresentationsSubscriptionResponse } from '/imports/ui/components/whiteboard/queries';
import { Presentation } from '../room-managment-state/types';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import SidebarCreateBreakout from './component';

interface SidebarCreateBreakoutContainerProps {
  setIsOpen: (value: boolean) => void;
}

const SidebarCreateBreakoutContainer: React.FC<SidebarCreateBreakoutContainerProps> = ({
  setIsOpen,
}) => {
  const intl = useIntl();
  const [timeSync] = useTimeSync();

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    breakoutPolicies: m.breakoutPolicies,
    durationInSeconds: m.durationInSeconds,
    createdTime: m.createdTime,
    meetingId: m.meetingId,
  }));

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery<getUserResponse>(getUser, {
    fetchPolicy: 'network-only',
  });

  const {
    data: meetingGroupData,
    loading: meetingGroupLoading,
    error: meetingGroupError,
  } = useQuery<getMeetingGroupResponse>(getMeetingGroup, {
    fetchPolicy: 'cache-first',
  });

  const { data: presentationData } = useDeduplicatedSubscription<
    PresentationsSubscriptionResponse>(PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];
  const currentPresentation = presentations.find(
    (p: Presentation) => p.current,
  )?.presentationId || '';

  const queryError = usersError || meetingGroupError;
  const prevErrorRef = useRef(queryError);

  useEffect(() => {
    if (queryError && queryError !== prevErrorRef.current) {
      notify(intl.formatMessage({
        id: 'app.error.issueLoadingData',
      }), 'warning', 'warning');
      logger.error({
        logCode: 'subscription_Failed',
        extraInfo: {
          error: queryError,
        },
      });
    }
    prevErrorRef.current = queryError;
  }, [queryError, intl]);

  if (usersLoading || meetingGroupLoading || !currentMeeting) {
    return null;
  }

  if (queryError) {
    return null;
  }

  return (
    <SidebarCreateBreakout
      users={currentMeeting?.meetingId
        ? filterByMeetingId(
          usersData?.user,
          currentMeeting.meetingId,
          getUser,
          (u) => ({ mismatchedUserId: u.userId, mismatchedName: u.name }),
        )
        : []}
      presentations={presentations}
      currentPresentation={currentPresentation}
      isBreakoutRecordable={currentMeeting?.breakoutPolicies?.record ?? true}
      groups={meetingGroupData?.meeting_group ?? []}
      setIsOpen={setIsOpen}
      durationInSeconds={currentMeeting?.durationInSeconds ?? 0}
      createdTime={currentMeeting?.createdTime ?? 0}
      timeSync={timeSync}
    />
  );
};

export default SidebarCreateBreakoutContainer;
