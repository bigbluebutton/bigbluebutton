/* eslint-disable jsx-a11y/no-access-key */
import React, { memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { PANELS } from '../../layout/enums';
import { GET_GUEST_WAITING_USERS_SUBSCRIPTION, GuestWaitingUsers } from '/imports/ui/components/user-list/guest-management/waiting-users/queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import { RAISED_HAND_USERS, RaisedHandUsersSubscriptionResponse, USER_AGGREGATE_COUNT_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';
import { UserAggregateCountSubscriptionResponse } from '/imports/ui/components/user-list/types';
import { BaseSidebarButtonProps } from '../types';
import Styled from './styles';

const intlMessages = defineMessages({
  usersListLabel: {
    id: 'app.userList.participantsTitle',
    description: 'Title for the participants list',
  },
});

const UsersListItem: React.FC<BaseSidebarButtonProps> = ({ isOpened }) => {
  const TOGGLE_USER_LIST_SHORTCUT = useShortcut('toggleUserList');
  const intl = useIntl();

  const {
    data: usersCountData,
  } = useDeduplicatedSubscription<UserAggregateCountSubscriptionResponse>(USER_AGGREGATE_COUNT_SUBSCRIPTION);
  const usersCount = usersCountData?.user_aggregate?.aggregate?.count ?? 0;

  const {
    data: guestWaitingUsersData,
  } = useDeduplicatedSubscription<GuestWaitingUsers>(GET_GUEST_WAITING_USERS_SUBSCRIPTION);
  const {
    data: raisedHandUsersData,
  } = useDeduplicatedSubscription<RaisedHandUsersSubscriptionResponse>(
    RAISED_HAND_USERS,
    { skip: isOpened },
  );

  const label = intl.formatMessage(intlMessages.usersListLabel);
  const hasNotification = (guestWaitingUsersData?.user_guest?.length ?? 0) > 0
    || (raisedHandUsersData?.user?.length ?? 0) > 0;

  return (
    <SidebarNavigationButton
      panel={PANELS.USERLIST}
      isOpened={isOpened}
      iconName="user_list"
      label={label}
      accessKey={TOGGLE_USER_LIST_SHORTCUT}
      id="users-list-toggle-button"
      ariaDescribedBy="usersList"
      dataTest="usersListSidebarButton"
      hasNotification={hasNotification}
    >
      <Styled.GuestNumberIndicatorWrapper $count={usersCount}>
        <Styled.GuestNumberIndicator>
          {usersCount}
        </Styled.GuestNumberIndicator>
      </Styled.GuestNumberIndicatorWrapper>
    </SidebarNavigationButton>
  );
};

export default memo(UsersListItem);
