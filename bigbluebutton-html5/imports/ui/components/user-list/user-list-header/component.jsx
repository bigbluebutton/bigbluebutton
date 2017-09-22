import React from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import styles from './styles';

const intlMessages = defineMessages({
  participantsTitle: {
    id: 'app.userlist.participantsTitle',
    description: 'Title for the Users list',
  },
});

const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
};

const defaultProps = {
  compact: false,
};

const UserListHeader = props => (
  <div className={styles.header}>
    {
      !props.compact ?
        <div className={styles.headerTitle} role="banner">
          {props.intl.formatMessage(intlMessages.participantsTitle)}
        </div> : null
    }
    {/* <Button
        label={intl.formatMessage(intlMessages.toggleCompactView)}
        hideLabel
        icon={!this.state.compact ? 'left_arrow' : 'right_arrow'}
        className={styles.btnToggle}
        onClick={this.handleToggleCompactView}
      /> */}
  </div>
);

UserListHeader.propTypes = propTypes;
UserListHeader.defaultProps = defaultProps;

export default UserListHeader;
