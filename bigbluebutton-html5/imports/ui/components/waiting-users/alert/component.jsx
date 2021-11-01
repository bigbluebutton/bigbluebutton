import React, { Component } from 'react';
import _ from 'lodash';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';
import { defineMessages, injectIntl } from 'react-intl';
import Settings from '/imports/ui/services/settings';
import { styles } from './styles';

const CDN = Meteor.settings.public.app.cdn;
const BASENAME = Meteor.settings.public.app.basename;
const HOST = CDN + BASENAME;
const GUEST_WAITING_BELL_THROTTLE_TIME = 10000;

function ringGuestWaitingBell() {
  if (Settings.application.guestWaitingAudioAlerts) {
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
    // The throttle prevents the bell from annoying the mods when a lot of
    // guests are entering almost at the same time
    this.ringGuestWaitingBell = _.throttle(
      ringGuestWaitingBell,
      GUEST_WAITING_BELL_THROTTLE_TIME,
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

    if (Settings.application.guestWaitingPushAlerts) {
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

    this.ringGuestWaitingBell();
  }

  render() {
    return null;
  }
}

export default injectIntl(injectNotify(PendingUsersAlert));
