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
  appToastChatPublic: {
    id: 'app.toast.chat.public',
    description: 'when entry various message',
  },
  appToastChatPrivate: {
    id: 'app.toast.chat.private',
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

  mapContentText(message) {
    const {
      intl,
    } = this.props;
    const contentMessage = message
      .map((content) => {
        if (content.text === 'PUBLIC_CHAT_CLEAR') return intl.formatMessage(intlMessages.publicChatClear);
        /* this code is to remove html tags that come in the server's messangens */
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content.text;
        const textWithoutTag = tempDiv.innerText;
        return textWithoutTag;
      });
    return contentMessage;
  }

  createMessage(name, message) {
    return (
      <div className={styles.pushMessageContent}>
        <h3 className={styles.userNameMessage}>{name}</h3>
        <div className={styles.contentMessage}>
          {
            this.mapContentText(message)
            .reduce((acc, text) => [...acc, (<br />), text], []).splice(1)
          }
        </div>
      </div>
    );
  }

  notifyPrivateChat() {
    const {
      disableNotify,
      openChats,
      intl,
      currentChatID,
    } = this.props;

    if (disableNotify) return;

    const hasUnread = ({ unreadCounter }) => unreadCounter > 0;
    const isNotNotified = ({ id, unreadCounter }) => unreadCounter !== this.state.notified[id];
    const isPrivate = ({ id }) => id !== PUBLIC_KEY;
    const thisChatClosed = ({ id }) => id !== currentChatID;

    const chatsNotify = openChats
      .filter(hasUnread)
      .filter(isNotNotified)
      .filter(isPrivate)
      .filter(thisChatClosed)
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
        message: intl.formatMessage(intlMessages.appToastChatPrivate),
      }));

    return (
      <span>
        {
        chatsNotify.map(({ id, message, name }) => {
          const getChatmessages = UnreadMessages.getUnreadMessages(id)
          .filter(({ fromTime, fromUserId }) => fromTime > (this.state.notified[fromUserId] || 0));

          const reduceMessages = Service
            .reduceAndMapMessages(getChatmessages);

          if (!reduceMessages.length) return null;

          const flatMessages = _.flatten(reduceMessages
            .map(msg => this.createMessage(name, msg.content)));
          const limitingMessages = flatMessages;

          return (<ChatPushNotification
            key={id}
            chatId={id}
            content={limitingMessages}
            message={<span >{message}</span>}
            onOpen={() => {
              this.setState(({ notified }) => ({
                notified: {
                  ...notified,
                  [id]: new Date().getTime(),
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
      currentChatID,
    } = this.props;

    const publicUnread = UnreadMessages.getUnreadMessages(publicUserId);
    const publicUnreadReduced = Service.reduceAndMapMessages(publicUnread);

    if (disableNotify) return;
    if (!Service.hasUnreadMessages(publicUserId)) return;
    if (currentChatID === PUBLIC_KEY) return;

    const checkIfBeenNotified = ({ sender, time }) =>
      time > (this.state.publicNotified[sender.id] || 0);

    const chatsNotify = publicUnreadReduced
      .map(msg => ({
        ...msg,
        sender: {
          name: msg.sender ? msg.sender.name : intl.formatMessage(intlMessages.appToastChatSystem),
          ...msg.sender,
        },
      }))
      .filter(checkIfBeenNotified);
    return (
      <span>
        {
        chatsNotify.map(({ sender, time, content }) =>
            (<ChatPushNotification
              key={time}
              chatId={PUBLIC_KEY}
              name={sender.name}
              message={
                <span >
                  { intl.formatMessage(intlMessages.appToastChatPublic) }
                </span>
              }
              content={this.createMessage(sender.name, content)}
              onOpen={() => {
                this.setState(({ notified, publicNotified }) => ({
                  ...notified,
                  publicNotified: {
                    ...publicNotified,
                    [sender.id]: time,
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
