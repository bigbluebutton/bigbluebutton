import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useLazyQuery } from '@apollo/client';
import Trigger from '/imports/ui/components/common/control-header/right/component';
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
import { onSaveUserNames } from './service';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { Meeting } from '/imports/ui/Types/meeting';
import { GET_USER_NAMES } from '/imports/ui/core/graphql/queries/users';
import logger from '/imports/startup/client/logger';

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
  minimizeLabel: {
    id: 'app.userList.minimize',
    description: 'Label for the minimize button in the user list panel',
  },
  saveUsersNames: {
    id: 'app.actionsBar.actionsDropdown.saveUserNames',
    description: 'Label for the save user names button',
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
  const { data: meetingInfo } = useMeeting((meeting: Partial<Meeting>) => ({
    name: meeting?.name,
  }));
  const [getUsers, { data: usersData, error: usersError }] = useLazyQuery(GET_USER_NAMES, { fetchPolicy: 'no-cache' });
  const users = usersData?.user || [];

  useEffect(() => {
    if (usersError) {
      logger.error({
        logCode: 'user_options_get_users_error',
        extraInfo: { usersError },
      }, 'Error fetching users names');
    }
  }, [usersError]);

  useEffect(() => {
    if (users.length > 0) {
      onSaveUserNames(intl, meetingInfo?.name ?? '', users);
    }
  }, [users]);

  const renderGuestManagement = () => {
    if (!currentUserData?.isModerator) return null;
    return (
      <>
        <GuestManagement />
        <Styled.Separator />
      </>
    );
  };

  const renderScrollableSection = () => {
    return (
      <Styled.ScrollableSection id="scroll-box">
        {renderGuestManagement()}
        <UserListParticipants count={count} />
      </Styled.ScrollableSection>
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
          'aria-label': intl.formatMessage(intlMessages.minimizeLabel),
          'data-test': 'closeUserList',
          icon: 'minus',
          label: intl.formatMessage(intlMessages.minimizeLabel),
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
        customRightButton={(
          <Trigger
            data-test="downloadUserNamesList"
            icon="template_download"
            aria-label={intl.formatMessage(intlMessages.saveUsersNames)}
            label={intl.formatMessage(intlMessages.saveUsersNames)}
            onClick={getUsers}
          />
        )}
      />
      <Styled.Separator />
      {renderScrollableSection()}
      {renderCrowdActionButtons()}
    </Styled.PanelContent>
  );
};

export default UserList;
