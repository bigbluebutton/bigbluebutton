import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './styles';

import MessageForm from './message-form/component';
import MessageList from './message-list/component';
import Icon from '../icon/component';

const ELEMENT_ID = 'chat-messages';

export default class Chat extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      chatID,
      title,
      messages,
      scrollPosition,
      hasUnreadMessages,
      lastReadMessageTime,
      isChatLocked,
      actions,
    } = this.props;

    return (
      <section className={styles.chat}>
        <header className={styles.header}>
          <Link className={styles.closeChat} to="/users">
            <Icon iconName="left-arrow" /> {title}
          </Link>
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
          tabindex="0"
          role="log"
          aria-atomic="true"
          aria-relevant="additions"
        />
        <MessageForm
          disabled={isChatLocked}
          chatAreaId={ELEMENT_ID}
          chatTitle={title}
          handleSendMessage={actions.handleSendMessage}
        />
      </section>
    );
  }
}
