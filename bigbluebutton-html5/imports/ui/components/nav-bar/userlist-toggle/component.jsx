import React from 'react';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import Shortcut from '/imports/ui/components/shortcut/component';
import cx from 'classnames';
import styles from '../styles';

const propTypes = {
  intl: intlShape.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  handleToggleUserList: PropTypes.func.isRequired,
  hasUnreadMessages: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  toggleUserListLabel: {
    id: 'app.navBar.userListToggleBtnLabel',
    description: 'Toggle button label',
  },
});

class UserListToggle extends React.PureComponent {
  render() {
    const {
      hasUnreadMessages, isExpanded, handleToggleUserList, intl,
    } = this.props;

    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    return (
      <Shortcut keyCombo="Control+Alt+1">
        <Button
          onClick={handleToggleUserList}
          ghost
          circle
          hideLabel
          label={intl.formatMessage(intlMessages.toggleUserListLabel)}
          icon="user"
          className={cx(toggleBtnClasses)}
          aria-expanded={isExpanded}
          aria-describedby="newMessage"
        />
      </Shortcut>
    );
  }
}

export default injectIntl(UserListToggle);

UserListToggle.propTypes = propTypes;
