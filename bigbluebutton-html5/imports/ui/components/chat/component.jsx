import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './styles';

import MessageForm from './message-form/component';
import MessageList from './message-list/component';
import Icon from '../icon/component';
import ChatService from './service';

const ELEMENT_ID = 'chat-messages';

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.closeChat = this.closeChat.bind(this);
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

    return (
      <section className={styles.chat}>

        <header className={styles.header}>
          <Link to="/users">
            <Icon iconName="left-arrow"/> {title}
          </Link>

          {
            ((this.props.chatID == 'public') ?
              null :
              <Link to="/users">
                <Icon iconName="close" onClick={this.closeChat} className={styles.closeIcon}/>
              </Link>)
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

  closeChat() {
    ChatService.createClosedChatSession(this.props.chatID);
  }
}
