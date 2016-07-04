import React, { Component, PropTypes } from 'react';
import { FormattedTime } from 'react-intl';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';

import UserAvatar from '../../../user-avatar/component';

import styles from './styles';

const propTypes = {
  user: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    isPresenter: React.PropTypes.bool.isRequired,
    isVoiceUser: React.PropTypes.bool.isRequired,
    isModerator: React.PropTypes.bool.isRequired,
    image: React.PropTypes.string,
  }),
  message: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.arrayOf(React.PropTypes.string),
  ]).isRequired,
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
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export default class MessageListItem extends Component {
  constructor(props) {
    super(props);
    this.handleMessageInViewport = this.handleMessageInViewport.bind(this);
  }

  handleMessageInViewport() {
    const node = findDOMNode(this);
    const { removeEventListener } = node.parentNode;
    const { timeLastMessage, time } = this.props;

    if (isElementInViewport(node)) {
      this.props.handleReadMessage(timeLastMessage || time);
      eventsToBeBound.forEach(e => removeEventListener(e, this.handleMessageInViewport, false));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.timeLastMessage !== nextProps.timeLastMessage) {
      this.props.handleReadMessage(nextProps.timeLastMessage);
    }
  }

  componentDidMount() {
    const node = findDOMNode(this);
    const { addEventListener } = node.parentNode;
    eventsToBeBound.forEach(e => addEventListener(e, this.handleMessageInViewport, false));

    this.handleMessageInViewport();
  }

  componentWillUnmount() {
    const node = findDOMNode(this);
    const { removeEventListener } = node.parentNode;
    eventsToBeBound.forEach(e => removeEventListener(e, this.handleMessageInViewport, false));
  }

  render() {
    const {
      user,
      message,
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
          {message.map((text, i) => (
            <p
              className={styles.message}
              key={i}
              dangerouslySetInnerHTML={ { __html: text } } >
            </p>
          ))}
        </div>
      </div>
    );
  }

  renderSystemMessage() {
    const {
      message,
    } = this.props;

    return (
      <div className={cx(styles.item, styles.systemMessage)}>
        <div className={styles.content}>
          {message.map((text, i) => (
            <p
              className={styles.message}
              key={i}
              dangerouslySetInnerHTML={ { __html: text } } >
            </p>
          ))}
        </div>
      </div>
    );
  }
}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;
