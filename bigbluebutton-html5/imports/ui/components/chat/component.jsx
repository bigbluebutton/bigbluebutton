import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './styles';

import MessageForm from './message-form/component';
import MessageList from './message-list/component';
import Icon from '../icon/component';

import Button from '../button/component';
import cx from 'classnames';

const ELEMENT_ID = 'chat-messages';





export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.handleDismiss = this.handleDismiss.bind(this);
  }

  handleDismiss(){
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
          <Link className={styles.closeChat} to="/users">
            <Icon iconName="left-arrow" /> {title}
            <Button className={styles.closeBtn}
              label={'X'}
              icon={'close'}
              size={'lg'}
              circle={true}
              hideLabel={true}
              onClick={this.handleDismiss}
            />
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
