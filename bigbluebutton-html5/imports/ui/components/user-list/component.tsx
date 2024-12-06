import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import UserListParticipants from './user-list-participants/component';
import GuestManagement from './guest-management/component';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
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

  const renderGuestManagement = () => {
    if (!currentUserData?.isModerator) return null;
    return (
      <>
        <GuestManagement />
        <Styled.Separator />
      </>
    );
  };

  return (
    <Styled.PanelContent>
      <Styled.HeaderContainer
        title={intl.formatMessage(intlMessages.usersTitle)}
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
      <UserListParticipants />
    </Styled.PanelContent>
  );
};

export default UserList;
