import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
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
    <div className={styles.messages}>
      <div className={styles.container}>
        <h2 className={styles.smallTitle}>
          {intl.formatMessage(intlMessages.waitingUsersTitle)}
        </h2>
      </div>
      <div className={styles.scrollableList}>
        <div className={styles.list}>
          <div
            role="button"
            data-test="waitingUsersBtn"
            tabIndex={0}
            className={styles.listItem}
            onClick={toggleWaitingPanel}
            onKeyPress={() => { }}
          >
            <Icon iconName="user" />
            <span>{intl.formatMessage(intlMessages.title)}</span>
            <div className={styles.unreadMessages}>
              <div className={styles.unreadMessagesText}>
                {pendingUsers.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

WaitingUsers.propTypes = propTypes;

export default WaitingUsers;
