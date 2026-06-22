import React, {
  useEffect, useCallback, memo, useState, useMemo,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useLazyQuery } from '@apollo/client';
import Trigger from '/imports/ui/components/common/control-header/right/component';
import PanelHeader from '/imports/ui/components/common/panel-header/component';
import UserListParticipants from './user-list-participants/component';
import GuestManagement from './guest-management/component';
import RaisedHandsContainer from './raised-hands/component';
import UserSearchContainer from './user-search/container';
import isUserListSearchEnabled from './user-search/service';
import { makeUserSearchWhere, onSaveUserNames } from './service';
import { PANELS } from '/imports/ui/components/layout/enums';
import CrowActionsButtons from '/imports/ui/components/user-list/crowd-action-buttons/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
} from './queries';
import {
  USER_AGGREGATE_COUNT_SUBSCRIPTION as USER_SEARCH_AGGREGATE_COUNT_SUBSCRIPTION,
} from './user-list-participants/queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { UserAggregateCountSubscriptionResponse, UserListComponentProps } from './types';
import Styled from './styles';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { RAISED_HAND_USERS, GET_USER_NAMES } from '/imports/ui/core/graphql/queries/users';
import logger from '/imports/startup/client/logger';
import { RaisedHandUser } from '/imports/ui/Types/user';
import { filterByMeetingId } from '/imports/ui/core/utils/subscriptionFilters';

interface GetUserNamesResponse {
  user: Array<{
    meetingId: string;
    name: string;
    nameSortable: string;
    firstNameSortable: string;
    lastNameSortable: string;
    userId: string;
  }>;
}

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
  hideUserListTitle: {
    id: 'app.userList.lockedUsersTitle',
    description: 'Title for the Header when user is locked',
  },
  usersStaticTitle: {
    id: 'app.userList.usersStaticTitle',
    description: 'Users title without the count of participants',
  },
  minimize: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Label for the minimize button in the user list panel',
  },
  saveUsersNames: {
    id: 'app.actionsBar.actionsDropdown.saveUserNames',
    description: 'Label for the save user names button',
  },
});

const UserList: React.FC<UserListComponentProps> = () => {
  const intl = useIntl();
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchWhere = useMemo(() => makeUserSearchWhere(searchQuery), [searchQuery]);
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
    locked: user?.locked ?? false,
  }));
  const {
    data: countData,
  } = useDeduplicatedSubscription<
    UserAggregateCountSubscriptionResponse>(USER_AGGREGATE_COUNT_SUBSCRIPTION);
  const count: number = countData?.user_aggregate?.aggregate?.count || 0;
  const {
    loading: searchCountLoading,
  } = useDeduplicatedSubscription<
    UserAggregateCountSubscriptionResponse>(USER_SEARCH_AGGREGATE_COUNT_SUBSCRIPTION,
      {
        variables: { where: searchWhere },
        skip: !isUserListSearchEnabled() || !searchQuery,
      });
  const { data: raisedHandsData } = useDeduplicatedSubscription<{
    user: RaisedHandUser[]
  }>(RAISED_HAND_USERS);
  const hasRaisedHands = (raisedHandsData?.user?.length ?? 0) > 0;
  const { data: meetingInfo } = useMeeting((meeting) => ({
    name: meeting?.name,
    lockSettings: meeting?.lockSettings,
    isBreakout: meeting?.isBreakout,
    meetingId: meeting?.meetingId,
  }));
  const [getUsers, { data: usersData, error: usersError }] = useLazyQuery<GetUserNamesResponse>(GET_USER_NAMES, { fetchPolicy: 'no-cache' });
  const users = usersData?.user || [];
  const isolateUsers = currentUserData?.locked && meetingInfo?.lockSettings?.isolateUsers;
  const handleGetUsers = useCallback(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (usersError) {
      logger.error({
        logCode: 'user_options_get_users_error',
        extraInfo: { usersError },
      }, 'Error fetching users names');
    }
  }, [usersError]);

  useEffect(() => {
    if (users.length > 0 && meetingInfo?.meetingId) {
      const filteredUsers = filterByMeetingId(
        users,
        meetingInfo.meetingId,
        GET_USER_NAMES,
        (u) => ({ mismatchedUserId: u.userId, mismatchedName: u.name }),
      );
      onSaveUserNames(intl, meetingInfo?.name ?? '', filteredUsers);
    }
  }, [users, meetingInfo?.meetingId]);

  const renderGuestManagement = useCallback(() => {
    if (!currentUserData?.isModerator || meetingInfo?.isBreakout) return null;
    return <GuestManagement searchQuery={searchQuery} />;
  }, [currentUserData, meetingInfo, searchQuery]);

  const renderScrollableSection = useCallback(() => {
    if (hasRaisedHands) {
      return (
        <Styled.SplitScrollContainer id="scroll-box" ref={parentRef}>
          {renderGuestManagement()}
          <RaisedHandsContainer searchQuery={searchQuery} />
          <Styled.ParticipantsScrollSection>
            <UserListParticipants parentRef={parentRef} searchQuery={searchQuery} />
          </Styled.ParticipantsScrollSection>
        </Styled.SplitScrollContainer>
      );
    }

    return (
      <Styled.ScrollableSection id="scroll-box" ref={parentRef}>
        {renderGuestManagement()}
        <RaisedHandsContainer searchQuery={searchQuery} />
        <UserListParticipants parentRef={parentRef} searchQuery={searchQuery} />
      </Styled.ScrollableSection>
    );
  }, [renderGuestManagement, searchQuery]);

  const renderCrowdActionButtons = useCallback(() => {
    if (!currentUserData?.isModerator) return null;
    return (
      <>
        <Styled.Separator />
        <CrowActionsButtons isBreakout={meetingInfo?.isBreakout} />
      </>
    );
  }, [currentUserData, meetingInfo?.isBreakout]);

  const title = isolateUsers
    ? intl.formatMessage(intlMessages.hideUserListTitle, { userCount: count })
    : intl.formatMessage(intlMessages.usersTitle, { userCount: count });

  return (
    <Styled.PanelContent data-test="userListPanel">
      <PanelHeader
        panelId={PANELS.USERLIST}
        title={title}
        dataTest="userListTitle"
        closeButtonLabel={intl.formatMessage(
          intlMessages.minimize,
          { panelName: intl.formatMessage(intlMessages.usersStaticTitle) },
        )}
        closeButtonDataTest="closeUserList"
        customRightButton={(
          <Trigger
            data-test="downloadUserNamesList"
            icon="template_download"
            aria-label={intl.formatMessage(intlMessages.saveUsersNames)}
            label={intl.formatMessage(intlMessages.saveUsersNames)}
            onClick={handleGetUsers}
          />
        )}
      />
      <Styled.Separator />
      <UserSearchContainer
        onSearchChange={setSearchQuery}
        isQueryLoading={searchCountLoading}
      />
      {renderScrollableSection()}
      {renderCrowdActionButtons()}
    </Styled.PanelContent>
  );
};

export default memo(UserList);
