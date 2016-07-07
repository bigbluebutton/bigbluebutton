import React, { Component, PropTypes } from 'react';
import { FormattedTime } from 'react-intl';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';

import UserAvatar from '/imports/ui/components/user-avatar/component';
import Message from './message/component';

import styles from './styles';

const propTypes = {
  user: React.PropTypes.object,
  messages: React.PropTypes.array.isRequired,
  time: PropTypes.number.isRequired,
};

const defaultProps = {
};

export default class MessageListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      user,
      messages,
      time,
    } = this.props;

    const dateTime = new Date(time);

    if (!user) {
      return this.renderSystemMessage();
    }

    return (
      <div className={styles.item}>
        <div className={styles.avatar}>
          <UserAvatar user={user} />
        </div>
        <div className={styles.content}>
          <div className={styles.meta}>
            <div className={styles.name}>
              <span>{user.name}</span>
            </div>
            <time className={styles.time} datetime={dateTime}>
              <FormattedTime value={dateTime}/>
            </time>
          </div>
          <div className={styles.messages}>
            {messages.map((message, i) => (
              <Message
                className={styles.message}
                key={i}
                text={message.text}
                time={message.time}
                chatAreaId={this.props.chatAreaId}
                handleReadMessage={this.props.handleReadMessage}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  renderSystemMessage() {
    const {
      messages,
    } = this.props;

    return (
      <div className={cx(styles.item, styles.systemMessage)}>
        <div className={styles.content}>
          <div className={styles.messages}>
            {messages.map((message, i) => (
              <Message
                className={styles.message}
                key={i}
                text={message.text}
                time={message.time}
                chatAreaId={this.props.chatAreaId}
                handleReadMessage={this.props.handleReadMessage}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;
