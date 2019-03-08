import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { Session } from 'meteor/session';
import { styles } from './styles';

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

class WaitingUsers extends PureComponent {

  static toggleWaitingPanel() {
    Session.set(
      'openPanel',
      Session.get('openPanel') === 'waitingUsersPanel'
        ? 'userlist'
        : 'waitingUsersPanel',
    );
  }

  render() {
    const {
      intl,
      pendingUsers,
    } = this.props;

    
    return (
      <div className={styles.messages}>
        {
          <h2 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.waitingUsersTitle)}
          </h2>
        }
        <div className={styles.scrollableList}>
          <div
            role='button'
            tabIndex={0}
            className={styles.noteLink}
            onClick={WaitingUsers.toggleWaitingPanel}
          >
            <Icon iconName="user" className={styles.icon} />
            <span className={styles.label}>{intl.formatMessage(intlMessages.title)}</span>
            <div className={styles.waitingUsersWarn}>
              <div className={styles.waitingUsersWarnText}>
                {pendingUsers.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

WaitingUsers.propTypes = propTypes;

export default WaitingUsers;
