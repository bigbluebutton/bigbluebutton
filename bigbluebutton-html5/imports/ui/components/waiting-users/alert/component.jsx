import React, { Component } from 'react';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles';

const intlMessages = defineMessages({
  pendingGuestAlert: {
    id: 'app.userList.guest.pendingGuestAlert',
    description: 'Title for the notes list',
  },
});

class PendingUsersAlert extends Component {
  static messageElement(text, style) {
    return (
      <div className={style}>
        { text }
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      notifiedIds: [],
    };

    this.notifyAndStore = this.notifyAndStore.bind(this);
  }

  componentDidMount() {
    const {
      pendingtUsers,
      joinTime,
    } = this.props;
    const { notifiedIds } = this.state;
    const notifiedPendingUsers = pendingtUsers
      .filter(user => user.loginTime < joinTime)
      .map(user => user.intId);
    this.setState({ notifiedIds: [...notifiedIds, ...notifiedPendingUsers] });
  }

  componentDidUpdate() {
    const {
      pendingtUsers,
      managementPanelIsOpen,
      currentUserIsModerator,
    } = this.props;
    const { notifiedIds } = this.state;

    pendingtUsers
      .filter(user => !notifiedIds.includes(user.intId))
      .forEach((user) => {
        if (managementPanelIsOpen || !currentUserIsModerator) {
          return this.storeId(user.intId);
        }
        return this.notifyAndStore(user);
      });
  }

  storeId(id) {
    const { notifiedIds } = this.state;
    this.setState({ notifiedIds: [...notifiedIds, id] });
  }

  notifyAndStore(user) {
    const { notify, intl } = this.props;
    notify(
      PendingUsersAlert.messageElement(user.name, styles.titleMessage),
      'info',
      'user',
      { onOpen: this.storeId(user.intId) },
      PendingUsersAlert.messageElement(
        intl.formatMessage(intlMessages.pendingGuestAlert),
        styles.contentMessage,
      ),
      true,
    );
  }

  render() {
    return null;
  }
}

export default injectIntl(injectNotify(PendingUsersAlert));
