import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import UserListService from '/imports/ui/components/user-list/service';
import Settings from '/imports/ui/services/settings';
import { notify } from '/imports/ui/services/notification';

const intlMessages = defineMessages({
  appToastChatSigular: {
    id: 'app.toast.chat.singular',
    description: 'when entry a message',
  },
  appToastChatPlural: {
    id: 'app.toast.chat.plural',
    description: 'when entry various message',
  },
});

class ChatNotificationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { notified: {} };
    this.audio = new Audio('/html5client/resources/sounds/notify.mp3');
  }

  componentWillReceiveProps({ openChats }) {
    const notifiedToClear = {};
    openChats
      .filter(c => c.unreadCounter === 0)
      .forEach((c) => {
        notifiedToClear[c.id] = 0;
      });
    this.setState(({ notified }) => ({
      notified: {
        ...notified,
        ...notifiedToClear,
      },
    }));
  }

  componentDidUpdate(prevProps) {
    if (this.props.unreadMessagesCount > prevProps.unreadMessagesCount) {
      this.playAudio();
    }

    this.toastNotification();
  }

  playAudio() {
    if (this.props.disableAudio) return;
    _.debounce(() => this.audio.play(), this.audio.duration * 1000)();
  }

  toastNotification() {
    const {
      intl,
      disableNotify,
      chatsNotify,
    } = this.props;
    if (disableNotify) return;

    chatsNotify.forEach((cn) => {
      if (cn.unreadCounter === this.state.notified[cn.id]) return;
      _.debounce(() => {
        const message = intl.formatMessage(
          cn.unreadCounter > 1 ?
        intlMessages.appToastChatPlural :
        intlMessages.appToastChatSigular, {
          0: cn.unreadCounter,
          1: cn.name,
        });

        notify(message, 'info', 'chat', {
          onOpen: () => {
            this.setState(({ notified }) => ({
              notified: {
                ...notified,
                [cn.id]: cn.unreadCounter,
              },
            }));
          },
        });
      }, 1000)();
    });
  }

  render() {
    return null;
  }
}


export default injectIntl(createContainer(({ currentChatID }) => {
  const AppSettings = Settings.application;

  const openChats = UserListService.getOpenChats();
  const unreadMessagesCount = openChats
    .map(chat => chat.unreadCounter)
    .reduce((a, b) => a + b, 0);

  const chatsNotify = openChats.filter(c => c.unreadCounter > 0);
  return {
    disableAudio: !AppSettings.chatAudioNotifications,
    disableNotify: !AppSettings.chatPushNotifications,
    unreadMessagesCount,
    chatsNotify,
    openChats,
  };
}, ChatNotificationContainer));
