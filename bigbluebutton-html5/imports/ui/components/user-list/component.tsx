import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import UserListParticipants from './user-list-participants/component';
import GuestManagement from './guest-management/component';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import CrowActionsButtons from '/imports/ui/components/user-list/crowd-action-buttons/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
} from './queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { UserListComponentProps } from './types';
import Styled from './styles';

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
  closeLabel: {
    id: 'app.userList.close',
    description: 'Label for the close button in the user list panel',
  },
});

const UserList: React.FC<UserListComponentProps> = () => {
  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const {
    data: countData,
  } = useDeduplicatedSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION);
  const count: number = countData?.user_aggregate?.aggregate?.count || 0;

  const renderGuestManagement = () => {
    if (!currentUserData?.isModerator) return null;
    return (
      <>
        <GuestManagement />
        <Styled.Separator />
      </>
    );
  };

  const renderCrowdActionButtons = () => {
    if (!currentUserData?.isModerator) return null;
    return (
      <>
        <Styled.Separator />
        <CrowActionsButtons />
      </>
    );
  };

  return (
    <Styled.PanelContent>
      <Styled.HeaderContainer
        title={intl.formatMessage(intlMessages.usersTitle, { 0: count })}
        rightButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.closeLabel),
          'data-test': 'closeUserList',
          icon: 'close',
          label: intl.formatMessage(intlMessages.closeLabel),
          onClick: () => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.NONE,
            });
          },
        }}
      />
      <Styled.Separator />
      {renderGuestManagement()}
      <UserListParticipants count={count} />
      {renderCrowdActionButtons()}
    </Styled.PanelContent>
  );
};

export default UserList;
