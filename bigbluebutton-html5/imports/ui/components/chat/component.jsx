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
      chatName,
      title,
      messages,
      scrollPosition,
      hasUnreadMessages,
      lastReadMessageTime,
      isChatLocked,
      actions,
    } = this.props;

    let closeChatLabel = "close " + title;

    return (
      <section className={styles.chat}>

        <header className={styles.header}>
          <div className={styles.title}>
            <Link to="/users" role="button" aria-label={closeChatLabel}>
              <Icon iconName="left_arrow"/> {title}
            </Link>
          </div>
          <div className={styles.closeIcon}>
            {
              ((this.props.chatID == 'public') ?
                null :
                <Link to="/users">
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
        />
        <MessageForm
          disabled={isChatLocked}
          chatAreaId={ELEMENT_ID}
          chatTitle={title}
          chatName={chatName}
          handleSendMessage={actions.handleSendMessage}
        />
      </section>
    );
  }
}
