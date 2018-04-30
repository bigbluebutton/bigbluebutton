import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';
import MessageForm from './message-form/component';
import MessageList from './message-list/component';
import ChatDropdown from './chat-dropdown/component';
import Icon from '../icon/component';

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
});

const SHORTCUTS_CONFIG = Meteor.settings.public.app.shortcuts;
const HIDE_PRIVATE_CHAT_AK = SHORTCUTS_CONFIG.openStatus.accesskey;
const CLOSE_PRIVATE_CHAT_AK = SHORTCUTS_CONFIG.openStatus.accesskey;

const Chat = (props) => {
  const {
    chatID,
    chatName,
    title,
    messages,
    scrollPosition,
    hasUnreadMessages,
    lastReadMessageTime,
    partnerIsLoggedOut,
    isChatLocked,
    minMessageLength,
    maxMessageLength,
    actions,
    intl,
  } = props;

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
          <Link
            to="/users"
            role="button"
            aria-label={intl.formatMessage(intlMessages.hideChatLabel, { 0: title })}
            accessKey={HIDE_PRIVATE_CHAT_AK}
          >
            <Icon iconName="left_arrow" /> {title}
          </Link>
        </div>
        {
          chatID !== 'public' ?
            <Link
              to="/users"
              role="button"
              tabIndex={-1}
            >
              <Button
                className={styles.closeBtn}
                icon="close"
                size="md"
                hideLabel
                onClick={() => actions.handleClosePrivateChat(chatID)}
                aria-label={intl.formatMessage(intlMessages.closeChatLabel, { 0: title })}
                label={intl.formatMessage(intlMessages.closeChatLabel, { 0: title })}
                accessKey={CLOSE_PRIVATE_CHAT_AK}
              />
            </Link> :
            <ChatDropdown />
        }
      </header>
      <MessageList
        chatId={chatID}
        messages={messages}
        id={ELEMENT_ID}
        scrollPosition={scrollPosition}
        hasUnreadMessages={hasUnreadMessages}
        handleScrollUpdate={actions.handleScrollUpdate}
        handleReadMessage={actions.handleReadMessage}
        lastReadMessageTime={lastReadMessageTime}
        partnerIsLoggedOut={partnerIsLoggedOut}
      />
      <MessageForm
        disabled={isChatLocked}
        chatAreaId={ELEMENT_ID}
        chatTitle={title}
        chatName={chatName}
        minMessageLength={minMessageLength}
        maxMessageLength={maxMessageLength}
        handleSendMessage={actions.handleSendMessage}
      />
    </div>
  );
};

export default injectWbResizeEvent(injectIntl(Chat));

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
  scrollPosition: PropTypes.number,
  hasUnreadMessages: PropTypes.bool.isRequired,
  lastReadMessageTime: PropTypes.number.isRequired,
  partnerIsLoggedOut: PropTypes.bool.isRequired,
  isChatLocked: PropTypes.bool.isRequired,
  minMessageLength: PropTypes.number.isRequired,
  maxMessageLength: PropTypes.number.isRequired,
  actions: PropTypes.shape({
    handleClosePrivateChat: PropTypes.func.isRequired,
    handleReadMessage: PropTypes.func.isRequired,
    handleScrollUpdate: PropTypes.func.isRequired,
    handleSendMessage: PropTypes.func.isRequired,
  }).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const defaultProps = {
  scrollPosition: 0,
};

Chat.propTypes = propTypes;
Chat.defaultProps = defaultProps;
