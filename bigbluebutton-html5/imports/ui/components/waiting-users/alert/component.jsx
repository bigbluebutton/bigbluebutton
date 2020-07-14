import React, { Component } from 'react';
import _ from 'lodash';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles';

const CDN = Meteor.settings.public.app.cdn;
const BASENAME = Meteor.settings.public.app.basename;
const HOST = CDN + BASENAME;
const WAITING_GUEST_BELL = Meteor.settings.public.waitingGuestBell;

function ringWaitingGuestBell() {
  if (WAITING_GUEST_BELL.enabled) {
    const audio = new Audio(`${HOST}/resources/sounds/doorbell.mp3`);
    audio.play();
  }
}

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
    this.ringWaitingGuestBell = _.debounce(
      ringWaitingGuestBell,
      WAITING_GUEST_BELL.debounceTime,
      { leading: true, trailing: false },
    );
  }

  componentDidMount() {
    const {
      pendingUsers,
      joinTime,
    } = this.props;
    const { notifiedIds } = this.state;
    const notifiedPendingUsers = pendingUsers
      .filter(user => user.loginTime < joinTime)
      .map(user => user.intId);
    this.setState({ notifiedIds: [...notifiedIds, ...notifiedPendingUsers] });
  }

  componentDidUpdate() {
    const {
      pendingUsers,
      managementPanelIsOpen,
      currentUserIsModerator,
    } = this.props;
    const { notifiedIds } = this.state;

    pendingUsers
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
    this.ringWaitingGuestBell();
  }

  render() {
    return null;
  }
}

export default injectIntl(injectNotify(PendingUsersAlert));
