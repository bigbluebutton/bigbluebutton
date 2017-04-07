import React, { Component, PropTypes } from 'react';
import { FormattedTime } from 'react-intl';
import cx from 'classnames';
import _ from 'lodash';

import UserAvatar from '/imports/ui/components/user-avatar/component';
import Message from './message/component';

import styles from './styles';

const propTypes = {
  user: PropTypes.object,
  messages: PropTypes.array.isRequired,
  time: PropTypes.number.isRequired,
};

const defaultProps = {
};

const eventsToBeBound = [
  'scroll',
  'resize',
];

const isElementInViewport = (el) => {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 200 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + 200
  );
};

export default class MessageListItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      preventRender: false,
    };

    this.handleMessageInViewport = _.debounce(this.handleMessageInViewport.bind(this), 50);
  }

  handleMessageInViewport(e) {
    window.requestAnimationFrame(() => {
      const node = this.refs.item;
      const scrollArea = document.getElementById(this.props.chatAreaId);

      this.setState({ preventRender: !isElementInViewport(node) });
    });
  }

  componentDidMount() {
    const scrollArea = document.getElementById(this.props.chatAreaId);
    eventsToBeBound.forEach(
      e => scrollArea.addEventListener(e, this.handleMessageInViewport, false)
    );
  }

  componentWillUnmount() {
    const scrollArea = document.getElementById(this.props.chatAreaId);
    eventsToBeBound.forEach(
      e => scrollArea.removeEventListener(e, this.handleMessageInViewport, false)
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(this.state.preventRender && nextState.preventRender);
  }

  render() {
    console.count('MESSAGE RENDER');
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
        <div className={styles.avatar} ref="item">
          <UserAvatar user={user} />
        </div>
        <div className={styles.content}>
          <div className={styles.meta}>
            <div className={!user.isLoggedOut ? styles.name : styles.logout}>
              <span>{user.name}</span>
              {user.isLoggedOut ? <span className={styles.offline}>(offline)</span> : null}
            </div>
            <time className={styles.time} dateTime={dateTime}>
              <FormattedTime value={dateTime}/>
            </time>
          </div>
          <div className={styles.messages}>
            {messages.map((message, i) => (
              <Message
                className={styles.message}
                key={message.id}
                text={message.text}
                time={message.time}
                chatAreaId={this.props.chatAreaId}
                lastReadMessageTime={this.props.lastReadMessageTime}
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
        <div className={styles.content} ref="item">
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
