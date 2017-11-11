import React, { Component } from 'react';
import Button from '/imports/ui/components/button/component';
import { injectIntl } from 'react-intl';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import cx from 'classnames';
import styles from '../styles';

class UserListToggleBtn extends Component {
  render() {
    const { hasUnreadMessages, isExpanded, handleToggleUserList } = this.props;

    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    return (
      <Button
        onClick={handleToggleUserList}
        ghost
        circle
        hideLabel
        label={'toggle UserList'}
        icon={'user'}
        className={cx(toggleBtnClasses)}
        aria-expanded={isExpanded}
        aria-describedby="newMessage"
        ref={(ref) => { this.ref = ref; }}
      />
    );
  }
}

export default injectIntl(withShortcut(UserListToggleBtn, 'Control+Alt+0'));
