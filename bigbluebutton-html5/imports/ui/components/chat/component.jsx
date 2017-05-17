import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './styles';
import { defineMessages, injectIntl } from 'react-intl';
import MessageForm from './message-form/component';
import MessageList from './message-list/component';
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
              aria-label={intl.formatMessage(intlMessages.hideChatLabel, { 0: title })}>
                <Icon iconName="left_arrow"/> {title}
            </Link>
          </div>
          <div className={styles.closeIcon}>
            {
              ((this.props.chatID == 'public') ?
                null :
                <Link
                  to="/users"
                  role="button"
                  aria-label={intl.formatMessage(intlMessages.closeChatLabel, { 0: title })}>
                    <Icon iconName="close" onClick={() => actions.handleClosePrivateChat(chatID)}/>
                </Link>)
            }
          </div>
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
          handleSendMessage={actions.handleSendMessage}
        />
      </div>
    );
  }
}

export default injectIntl(Chat);
