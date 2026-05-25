import React, { useMemo, memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { RAISED_HAND_USERS } from '/imports/ui/core/graphql/queries/users';
import { filterByMeetingId } from '/imports/ui/core/utils/subscriptionFilters';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION } from '/imports/ui/components/whiteboard/queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { RaisedHandUser, User } from '/imports/ui/Types/user';
import { LockSettings, UsersPolicies } from '/imports/ui/Types/meeting';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import RaisedHandsList from './list/component';

const intlMessages = defineMessages({
  raisedHandsTitle: {
    id: 'app.statusNotifier.raisedHandsTitle',
    description: 'Raised hands section title with count',
  },
  lowerHandsLabel: {
    id: 'app.statusNotifier.lowerHands',
    description: 'Button label to lower all raised hands',
  },
});

const RaisedHandsContainer: React.FC<{ searchQuery?: string }> = ({ searchQuery }) => {
  const intl = useIntl();
  const [setRaiseHand] = useMutation(SET_RAISE_HAND);

  const { data: usersData, error: usersError } = useDeduplicatedSubscription<{
    user: RaisedHandUser[] }>(RAISED_HAND_USERS);

  const { data: meeting, loading: meetingLoading } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
    usersPolicies: m.usersPolicies,
    isBreakout: m.isBreakout,
    meetingId: m.meetingId,
  }));

  const { data: currentUser } = useCurrentUser((u: Partial<User>) => ({
    userId: u.userId,
    name: u.name,
    presenter: u.presenter,
    isModerator: u.isModerator,
    raiseHand: u.raiseHand,
    locked: u.locked,
    color: u.color,
  }));

  const { data: presentationData } = useDeduplicatedSubscription<{
    pres_page_curr: Array<{ pageId: string }> }>(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const pageId = presentationData?.pres_page_curr?.[0]?.pageId ?? '';

  if (usersError) {
    logger.error(
      { logCode: 'raisehand_notifier_container_subscription_error', extraInfo: { usersError } },
      'Error on requesting raise hand data',
    );
  }

  const raisedHands: RaisedHandUser[] = filterByMeetingId(
    usersData?.user,
    meeting?.meetingId,
    RAISED_HAND_USERS,
    (u) => ({ mismatchedUserId: u.userId, mismatchedName: u.name }),
  );

  const searchQueryLower = useMemo(() => searchQuery?.toLowerCase() ?? '', [searchQuery]);
  const filteredRaisedHands = useMemo(
    () => (searchQueryLower
      ? raisedHands.filter((u) => u.name.toLowerCase().includes(searchQueryLower))
      : raisedHands),
    [raisedHands, searchQueryLower],
  );

  if (!meeting || !currentUser || meetingLoading || filteredRaisedHands.length === 0) {
    return null;
  }

  const { isModerator, presenter: isPresenter } = currentUser;
  const canLowerAll = isModerator || isPresenter;

  const lowerUserHands = (userId: string) => {
    setRaiseHand({ variables: { userId, raiseHand: false } });
  };

  return (
    <>
      <Styled.RaisedHandsContainer>
        <Styled.TitleContainer>
          <Styled.RaisedHandsTitle>
            {intl.formatMessage(intlMessages.raisedHandsTitle, { count: filteredRaisedHands.length })}
          </Styled.RaisedHandsTitle>
        </Styled.TitleContainer>

        <RaisedHandsList
          raisedHands={filteredRaisedHands}
          currentUser={currentUser as User}
          meeting={{
            isBreakout: meeting.isBreakout ?? false,
            lockSettings: meeting.lockSettings as LockSettings,
            usersPolicies: meeting.usersPolicies as UsersPolicies,
          }}
          pageId={pageId}
        />

        {canLowerAll && (
          <Styled.ClearButton
            label={intl.formatMessage(intlMessages.lowerHandsLabel)}
            color="default"
            size="md"
            onClick={() => filteredRaisedHands.forEach((u) => lowerUserHands(u.userId))}
            data-test="raiseHandRejection"
          />
        )}
      </Styled.RaisedHandsContainer>
      <Styled.Separator />
    </>
  );
};

export default memo(RaisedHandsContainer);
