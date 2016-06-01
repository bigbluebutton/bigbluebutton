import React, { Component, PropTypes } from 'react';
import { FormattedTime } from 'react-intl';
import styles from './styles';

const propTypes = {
  user: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
  }).isRequired,
  message: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.arrayOf(React.PropTypes.string),
  ]).isRequired,
  time:  PropTypes.number.isRequired,
};

const defaultProps = {
};

export default class MessageListItem extends Component {
  render() {
    const {
      user,
      message,
      time,
    } = this.props;

    const dateTime = new Date(time);

    let messageTexts = message;

    if (!Array.isArray(message)) {
      messageTexts = [message];
    }

    return (
      <div className={styles.item}>
        <div className={styles.avatar}>
          lel
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
          {messageTexts.map((text, i) => (
            <p className={styles.message} key={i}>{text}</p>
          ))}
        </div>
      </div>
    );
  }
}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;
