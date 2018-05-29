import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import UnreadMessages from '/imports/ui/services/unread-messages';
import ChatAudioNotification from './audio-notification/component';
import ChatPushNotification from './push-notification/component';
import Service from '../service';
import { styles } from '../styles';

const propTypes = {
  disableNotify: PropTypes.bool.isRequired,
  openChats: PropTypes.arrayOf(PropTypes.object).isRequired,
  disableAudio: PropTypes.bool.isRequired,
};

const intlMessages = defineMessages({
  appToastChatSigular: {
    id: 'app.toast.chat.singular',
    description: 'when entry a message',
  },
  appToastChatPlural: {
    id: 'app.toast.chat.plural',
    description: 'when entry various message',
  },
  appToastChatPublic: {
    id: 'app.toast.chat.public',
    description: 'when entry various message',
  },
  appToastChatSystem: {
    id: 'app.toast.chat.system',
    description: 'system for use',
  },
  publicChatClear: {
    id: 'app.chat.clearPublicChatMessage',
    description: 'message of when clear the public chat',
  },
});

const PUBLIC_KEY = 'public';
const PRIVATE_KEY = 'private';

class ChatNotification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notified: Service.getNotified(PRIVATE_KEY),
      publicNotified: Service.getNotified(PUBLIC_KEY),
    };
    this.mapContent = this.mapContent.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      openChats,
      disableNotify,
    } = this.props;

    if (nextProps.disableNotify === false && disableNotify === true) {
      const loadMessages = {};
      openChats
        .forEach((c) => {
          loadMessages[c.id] = c.unreadCounter;
        });
      this.setState({ notified: loadMessages });
      return;
    }

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
    }), () => {
      Service.setNotified(PRIVATE_KEY, this.state.notified);
    });
  }

  mapContent(message) {
    const {
      intl,
    } = this.props;
    const contentMessage = message
      .map(content => (
        <div className={styles.toastChatContent} key={_.uniqueId('chat-push-')}>
          {content.text === 'PUBLIC_CHAT_CLEAR' ?
          intl.formatMessage(intlMessages.publicChatClear) : content.text}
        </div>));
    return contentMessage;
  }

  notifyPrivateChat() {
    const {
      disableNotify,
      openChats,
      intl,
    } = this.props;

    const chatsNotify = openChats
      .filter(({ id, unreadCounter }) =>
        unreadCounter > 0 &&
        unreadCounter !== this.state.notified[id] &&
        !disableNotify && id !== PUBLIC_KEY)
      .map(({
        id,
        name,
        unreadCounter,
        ...rest
      }) => ({
        ...rest,
        name,
        unreadCounter,
        id,
        message: intl.formatMessage(unreadCounter > 1 ?
          intlMessages.appToastChatPlural :
          intlMessages.appToastChatSigular, {
          0: unreadCounter,
          1: name,
        }),
      }));

    return (
      <span>
        {
        chatsNotify.map(({ id, unreadCounter, message }) => {
          const getChatmessages = UnreadMessages.getUnreadMessages(id);
          const reduceMessages = Service.reduceAndMapMessages(getChatmessages);
          const flatMessages = _.flatten(reduceMessages
            .map(msg => this.mapContent(msg.content)));
          const limitingMessages = flatMessages.slice(-4);

          return (<ChatPushNotification
            key={id}
            chatId={id}
            content={limitingMessages}
            message={<span className={styles.toastChatTitle}>{message}</span>}
            onOpen={() => {
              this.setState(({ notified }) => ({
                notified: {
                  ...notified,
                  [id]: unreadCounter,
                },
              }), () => {
                Service.setNotified(PRIVATE_KEY, this.state.notified);
              });
            }}
          />);
        })
        }
      </span>
    );
  }

  notifyPublicChat() {
    const {
      publicUserId,
      intl,
      disableNotify,
    } = this.props;

    const publicUnread = UnreadMessages.getUnreadMessages(publicUserId);
    const publicUnreadReduced = Service.reduceAndMapMessages(publicUnread);
    const chatsNotify = publicUnreadReduced
      .map(msg => ({
        ...msg,
        sender: {
          name: msg.sender ? msg.sender.name : intl.formatMessage(intlMessages.appToastChatSystem),
          ...msg.sender,
        },
      }))
      .filter(({ sender, time }) =>
        (time > (this.state.publicNotified[sender.name] || 0))
         && !disableNotify && Service.hasUnreadMessages(publicUserId));
    return (
      <span>
        {
        chatsNotify.map(({ sender, time, content }) =>
            (<ChatPushNotification
              key={time}
              chatId={PUBLIC_KEY}
              name={sender.name}
              message={
                <span className={styles.toastChatTitle}>
                  { intl.formatMessage(intlMessages.appToastChatPublic, { 0: sender.name }) }
                </span>
              }
              content={this.mapContent(content).slice(-4)}
              onOpen={() => {
                this.setState(({ notified, publicNotified }) => ({
                  ...notified,
                  publicNotified: {
                    ...publicNotified,
                    [sender.name]: time,
                  },
                }), () => {
                  Service.setNotified(PUBLIC_KEY, this.state.publicNotified);
                });
              }}
            />))
        }
      </span>
    );
  }

  render() {
    const {
      openChats,
      disableAudio,
    } = this.props;
    const unreadMessagesCount = openChats
      .map(chat => chat.unreadCounter)
      .reduce((a, b) => a + b, 0);
    const shouldPlayAudio = !disableAudio && unreadMessagesCount > 0;

    return (
      <span>
        <ChatAudioNotification play={shouldPlayAudio} count={unreadMessagesCount} />
        { this.notifyPublicChat() }
        { this.notifyPrivateChat() }
      </span>
    );
  }
}
ChatNotification.propTypes = propTypes;

export default injectIntl(ChatNotification);
