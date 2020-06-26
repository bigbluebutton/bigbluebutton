import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { styles } from '../styles.scss';
import WarningIcon from '../warning-icon/component';
import Service from '../service';

const propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

class EndMeetingUserListComponent extends Component {
  render() {
    const { users } = this.props;

    const { displayUsers, remainder } = Service.getUsersToDisplay(users);
    const list = users.length > 0 ? (
      <div>
        <div className={styles.warningItem}>
          <div className={styles.warningIcon}>
            <WarningIcon icon="warning" />
          </div>
          <p>Attention</p>
        </div>
        <div className={styles.userListText}>
          <p>This action will end the meeting for:</p>
          <ul className={styles.userListItemText}>
            {displayUsers.map(user => (
              <li key={user.userId}>
                {user.name}
              </li>
            ))}
          </ul>
          {remainder && (
            <p>
              and
              {' '}
              {remainder}
              {' '}
other active users in this session.
            </p>
          )}
        </div>
      </div>
    ) : null;
    return list;
  }
}

EndMeetingUserListComponent.propTypes = propTypes;

export default EndMeetingUserListComponent;
