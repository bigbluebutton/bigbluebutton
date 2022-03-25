import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import { ACTIONS, PANELS } from '../../../layout/enums';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const intlMessages = defineMessages({
  waitingUsersTitle: {
    id: 'app.userList.guest.waitingUsersTitle',
    description: 'Title for the notes list',
  },
  title: {
    id: 'app.userList.guest.waitingUsers',
    description: 'Title for the waiting users',
  },
});

const WaitingUsers = ({
  intl,
  pendingUsers,
  sidebarContentPanel,
  layoutContextDispatch,
}) => {
  const toggleWaitingPanel = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== PANELS.WAITING_USERS,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === PANELS.WAITING_USERS
        ? PANELS.NONE
        : PANELS.WAITING_USERS,
    });
  };

  return (
    <Styled.Messages>
      <Styled.Container>
        <Styled.SmallTitle>
          {intl.formatMessage(intlMessages.waitingUsersTitle)}
        </Styled.SmallTitle>
      </Styled.Container>
      <Styled.ScrollableList>
        <Styled.List>
          <Styled.ListItem
            role="button"
            data-test="waitingUsersBtn"
            tabIndex={0}
            onClick={toggleWaitingPanel}
            onKeyPress={() => { }}
          >
            <Icon iconName="user" />
            <span>{intl.formatMessage(intlMessages.title)}</span>
            {pendingUsers.length > 0 && (
              <Styled.UnreadMessages>
                <Styled.UnreadMessagesText>
                  {pendingUsers.length}
                </Styled.UnreadMessagesText>
              </Styled.UnreadMessages>
            )}
          </Styled.ListItem>
        </Styled.List>
      </Styled.ScrollableList>
    </Styled.Messages>
  );
};

WaitingUsers.propTypes = propTypes;

export default injectIntl(WaitingUsers);
