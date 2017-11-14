import React, { Component } from 'react';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { withShortcut } from '/imports/ui/components/shortcut/component';
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

class UserListToggleBtn extends Component {
  render() {
    const { hasUnreadMessages, isExpanded, handleToggleUserList, intl } = this.props;

    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    return (
      <Button
        onClick={handleToggleUserList}
        ghost
        circle
        hideLabel
        label={intl.formatMessage(intlMessages.toggleUserListLabel)}
        icon={'user'}
        className={cx(toggleBtnClasses)}
        aria-expanded={isExpanded}
        aria-describedby="newMessage"
        ref={(ref) => { this.ref = ref; }}
      />
    );
  }
}

export default injectIntl(withShortcut(UserListToggleBtn, 'Control+Alt+1'));

UserListToggleBtn.propTypes = propTypes;
