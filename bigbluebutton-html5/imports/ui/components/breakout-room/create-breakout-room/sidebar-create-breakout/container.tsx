import React, { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { useIntl } from 'react-intl';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useUsersBasicInfo from '/imports/ui/core/hooks/useUsersBasicInfo';
import { UserBasicInfo } from '/imports/ui/Types/user';
import {
  getMeetingGroup,
  getMeetingGroupResponse,
} from '../queries';
import { PRESENTATIONS_SUBSCRIPTION, PresentationsSubscriptionResponse } from '/imports/ui/components/whiteboard/queries';
import { Presentation, BreakoutUser } from '../room-managment-state/types';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import SidebarCreateBreakout from './component';

const SidebarCreateBreakoutContainer: React.FC = () => {
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
    errors: usersErrors,
  } = useUsersBasicInfo(useMemo(() => (user: Partial<UserBasicInfo>) => ({
    userId: user.userId,
    extId: user.extId,
    name: user.name,
    isModerator: user.isModerator,
    bot: user.bot,
  }), []));

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

  const usersError = usersErrors?.[0];
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
      users={(usersData?.filter((u) => !u.bot) ?? []) as BreakoutUser[]}
      presentations={presentations}
      currentPresentation={currentPresentation}
      isBreakoutRecordable={currentMeeting?.breakoutPolicies?.record ?? true}
      groups={meetingGroupData?.meeting_group ?? []}
      durationInSeconds={currentMeeting?.durationInSeconds ?? 0}
      createdTime={currentMeeting?.createdTime ?? 0}
      timeSync={timeSync}
    />
  );
};

export default SidebarCreateBreakoutContainer;
