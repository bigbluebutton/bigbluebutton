import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/button/component';
import { Session } from 'meteor/session';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { styles } from './styles.scss';
import MessageForm from './message-form/container';
import MessageList from './message-list/container';
import ChatDropdown from './chat-dropdown/component';

const ELEMENT_ID = 'chat-messages';

const intlMessages = defineMessages({
  closeChatLabel: {
    id: 'app.chat.closeChatLabel',
    description: 'aria-label for closing chat button',
  },
  hideChatLabel: {
    id: 'app.chat.hideChatLabel',
    description: 'aria-label for hiding chat button',
  },
  singularTyping: {
    id: 'app.chat.singularTyping',
    description: 'used to indicate when 1 user is typing',
  },
  pluralTyping: {
    id: 'app.chat.pluralTyping',
    description: 'used to indicate when multiple user are typing',
  },
  severalPeople: {
    id: 'app.chat.severalPeople',
    description: 'displayed when 4 or more users are typing',
  },
});
const Chat = (props) => {
  const {
    chatID,
    chatName,
    title,
    messages,
    partnerIsLoggedOut,
    isChatLocked,
    actions,
    intl,
    shortcuts,
    isMeteorConnected,
    typingUsers,
    currentUserId,
    startUserTyping,
    stopUserTyping,
    lastReadMessageTime,
    hasUnreadMessages,
    scrollPosition,
    UnsentMessagesCollection,
    minMessageLength,
    maxMessageLength,
  } = props;

  const HIDE_CHAT_AK = shortcuts.hidePrivateChat;
  const CLOSE_CHAT_AK = shortcuts.closePrivateChat;

  let names = [];

  names = typingUsers.map((user) => {
    const { userId: typingUserId, isTypingTo, name } = user;
    if (currentUserId === typingUserId) return null;
    if (chatID !== isTypingTo) {
      if (typingUserId === chatID) {
        return currentUserId !== isTypingTo
          ? null : name;
      }
      return null;
    }
    return name;
  }).filter(e => e);

  const renderIsTypingString = () => {
    if (names) {
      const { length } = names;
      const noTypers = length < 1;
      const singleTyper = length === 1;
      const multipleTypersShown = length > 1 && length <= 3;
      if (noTypers) return null;

      if (singleTyper) {
        if (names[0].length < 20) {
          return ` ${names[0]} ${intl.formatMessage(intlMessages.singularTyping)}`;
        }
        return (` ${names[0].slice(0, 20)}... ${intl.formatMessage(intlMessages.singularTyping)}`);
      }

      if (multipleTypersShown) {
        const formattedNames = names.map((name) => {
          if (name.length < 15) return ` ${name}`;
          return ` ${name.slice(0, 15)}...`;
        });
        return (`${formattedNames} ${intl.formatMessage(intlMessages.pluralTyping)}`);
      }
      return (` ${intl.formatMessage(intlMessages.severalPeople)} ${intl.formatMessage(intlMessages.pluralTyping)}`);
    }
  };

  return (
    <div
      data-test="publicChat"
      className={styles.chat}
    >
      <header className={styles.header}>
        <div
          data-test="chatTitle"
          className={styles.title}
        >
          <Button
            onClick={() => {
              Session.set('idChatOpen', '');
              Session.set('openPanel', 'userlist');
            }}
            aria-label={intl.formatMessage(intlMessages.hideChatLabel, { 0: title })}
            accessKey={HIDE_CHAT_AK}
            label={title}
            icon="left_arrow"
            className={styles.hideBtn}
          />
        </div>
        {
          chatID !== 'public'
            ? (
              <Button
                icon="close"
                size="sm"
                ghost
                color="dark"
                hideLabel
                onClick={() => {
                  actions.handleClosePrivateChat(chatID);
                  Session.set('idChatOpen', '');
                  Session.set('openPanel', 'userlist');
                }}
                aria-label={intl.formatMessage(intlMessages.closeChatLabel, { 0: title })}
                label={intl.formatMessage(intlMessages.closeChatLabel, { 0: title })}
                accessKey={CLOSE_CHAT_AK}
              />
            )
            : <ChatDropdown isMeteorConnected={isMeteorConnected} />
        }
      </header>
      <MessageList
        id={ELEMENT_ID}
        chatId={chatID}
        handleScrollUpdate={actions.handleScrollUpdate}
        handleReadMessage={actions.handleReadMessage}
        {...{
          partnerIsLoggedOut,
          lastReadMessageTime,
          hasUnreadMessages,
          scrollPosition,
          messages,
        }}
      />
      <MessageForm
        {...{
          UnsentMessagesCollection,
          chatName,
          minMessageLength,
          maxMessageLength,
          renderIsTypingString,
          startUserTyping,
          stopUserTyping,
        }}
        chatId={chatID}
        chatTitle={title}
        chatAreaId={ELEMENT_ID}
        disabled={isChatLocked || !isMeteorConnected}
        connected={isMeteorConnected}
        locked={isChatLocked}
        handleSendMessage={actions.handleSendMessage}
        partnerIsLoggedOut={partnerIsLoggedOut}
      />
    </div>
  );
};

export default withShortcutHelper(injectWbResizeEvent(injectIntl(memo(Chat))), ['hidePrivateChat', 'closePrivateChat']);

const propTypes = {
  chatID: PropTypes.string.isRequired,
  chatName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  messages: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ])).isRequired).isRequired,
  shortcuts: PropTypes.objectOf(PropTypes.string),
  partnerIsLoggedOut: PropTypes.bool.isRequired,
  isChatLocked: PropTypes.bool.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    handleClosePrivateChat: PropTypes.func.isRequired,
  }).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const defaultProps = {
  shortcuts: [],
};

Chat.propTypes = propTypes;
Chat.defaultProps = defaultProps;
