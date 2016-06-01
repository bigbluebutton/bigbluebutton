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
      title,
      messages,
    } = this.props;

    return (
      <section className={styles.chat}>
        <header className={styles.header}>
          <Link className={styles.closeChat} to="/users">
            <Icon iconName="left-arrow" /> {title}
          </Link>
        </header>
        <MessageList
          messages={messages}
          id={ELEMENT_ID}
          tabindex="0"
          role="log"
          aria-atomic="true"
          aria-relevant="additions"
        />
        <MessageForm chatAreaId={ELEMENT_ID} chatTitle={title} />
      </section>
    );
  }
}
