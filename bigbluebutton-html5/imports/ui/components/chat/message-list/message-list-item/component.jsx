import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedTime } from 'react-intl';
import cx from 'classnames';
import _ from 'lodash';

import UserAvatar from '/imports/ui/components/user-avatar/component';
import Message from './message/component';

import { styles } from './styles';

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
  const clientHeight = window.innerHeight || document.documentElement.clientHeight;
  const prefetchHeight = 125;

  return (
    rect.top >= -(prefetchHeight) &&
    rect.bottom <= clientHeight + prefetchHeight
  );
};

export default class MessageListItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pendingChanges: false,
      preventRender: true,
    };

    this.handleMessageInViewport = _.debounce(this.handleMessageInViewport.bind(this), 50);
  }

  handleMessageInViewport() {
    window.requestAnimationFrame(() => {
      const node = this.item;
      this.setState({ preventRender: !isElementInViewport(node) });
    });
  }

  componentDidMount() {
    const { getScrollAreaRef } = this.props;

    if (getScrollAreaRef && getScrollAreaRef()) {
      eventsToBeBound.forEach(
        (e) => { getScrollAreaRef().addEventListener(e, this.handleMessageInViewport, false); },
      );
    }

    this.handleMessageInViewport();
  }

  componentWillUnmount() {
    const { getScrollAreaRef } = this.props;

    if (getScrollAreaRef && getScrollAreaRef()) {
      eventsToBeBound.forEach(
        (e) => { getScrollAreaRef().removeEventListener(e, this.handleMessageInViewport, false); },
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.preventRender && !this.state.preventRender && this.state.pendingChanges) {
      this.setState({ pendingChanges: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.pendingChanges) return;

    const hasNewMessage = this.props.messages.length !== nextProps.messages.length;
    const hasUserChanged = !_.isEqual(this.props.user, nextProps.user);

    this.setState({ pendingChanges: hasNewMessage || hasUserChanged });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if((!this.props.getScrollAreaRef || !this.props.getScrollAreaRef()) &&
      (nextProps.getScrollAreaRef && nextProps.getScrollAreaRef())) return true;
    else return !nextState.preventRender && nextState.pendingChanges;
  }

  renderSystemMessage() {
    const {
      messages,
    } = this.props;

    return (
      <div className={cx(styles.item, styles.systemMessage)}>
        <div className={styles.content} ref={(ref) => { this.item = ref; }}>
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

  render() {
    const {
      user,
      messages,
      time,
      getScrollAreaRef
    } = this.props;

    const dateTime = new Date(time);

    if (!user) {
      return this.renderSystemMessage();
    }

    return (
      <div className={styles.item}>
        <div className={styles.wrapper} ref={(ref) => { this.item = ref; }}>
          <div className={styles.avatarWrapper}>
            <UserAvatar
              className={styles.avatar}
              color={user.color}
              moderator={user.isModerator}
            >
              {user.name.toLowerCase().slice(0, 2)}
            </UserAvatar>
          </div>
          <div className={styles.content}>
            <div className={styles.meta}>
              <div className={user.isOnline ? styles.name : styles.logout}>
                <span>{user.name}</span>
                {user.isOnline ? null : <span className={styles.offline}>(offline)</span>}
              </div>
              <time className={styles.time} dateTime={dateTime}>
                <FormattedTime value={dateTime} />
              </time>
            </div>
            <div className={styles.messages}>
              {messages.map(message => (
                <Message
                  className={styles.message}
                  key={message.id}
                  text={message.text}
                  time={message.time}
                  chatAreaId={this.props.chatAreaId}
                  lastReadMessageTime={this.props.lastReadMessageTime}
                  handleReadMessage={this.props.handleReadMessage}
                  getScrollAreaRef={this.props.getScrollAreaRef}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;
