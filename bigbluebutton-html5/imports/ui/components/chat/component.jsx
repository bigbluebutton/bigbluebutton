import React, { Component } from 'react';
import { Link } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles';
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

class Chat extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));
  }

  componentWillUnmount() {
    // to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));
  }

  render() {
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
    } = this.props;

    return (
      <div className={styles.chat}>
        <header className={styles.header}>
          <div className={styles.title}>
            <Link
              to="/users"
              role="button"
              aria-label={intl.formatMessage(intlMessages.hideChatLabel, { 0: title })}
            >
              <Icon iconName="left_arrow" /> {title}
            </Link>
          </div>
          {
            chatID !== 'public' ?
              <Link
                to="/users"
                role="button"
                className={styles.closeIcon}
                aria-label={intl.formatMessage(intlMessages.closeChatLabel, { 0: title })}
              >
                <Icon iconName="close" onClick={() => actions.handleClosePrivateChat(chatID)} />
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
  }
}

export default injectIntl(Chat);
