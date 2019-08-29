import React, { PureComponent } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import browser from 'browser-detect';
import PropTypes from 'prop-types';
import cx from 'classnames';
import _ from 'lodash';
import { styles } from '../styles.scss';

const propTypes = {
  intl: intlShape.isRequired,
  typingUsers: PropTypes.arrayOf(Object).isRequired,
};

const messages = defineMessages({
  singularTyping: {
    id: 'app.chat.singularTyping',
    description: 'used to indicate when 1 user is typing',
  },
  pluralTyping: {
    id: 'app.chat.pluralTyping',
    description: 'used to indicate when multiple user are typing',
  },
  severalPeople: {
    id: 'app.chat.severalPeople',
    description: 'displayed when 4 or more users are typing',
  },
});


class TypingIndicator extends PureComponent {
  constructor(props) {
    super(props);

    this.BROWSER_RESULTS = browser();

    this.renderTypingElement = this.renderTypingElement.bind(this);
    this.renderAnimation = this.renderAnimation.bind(this);
  }

  renderAnimation(element = null, form) {
    const { intl } = this.props;

    if (!element) {
      return (
        <span className={styles.animWrapper} key="animWrapper">
          {`${intl.formatMessage(messages.severalPeople)} ${intl.formatMessage(messages.pluralTyping)}`}
          <span className={styles.connectingAnimation} />
        </span>
      );
    }

    element.push(
      (
        <span className={styles.animWrapper} key="animWrapper">
          &nbsp;
          {
            form === 'single'
              ? `${intl.formatMessage(messages.singularTyping)}`
              : `${intl.formatMessage(messages.pluralTyping)}`
          }
          <span className={styles.connectingAnimation} />
        </span>
      ),
    );
    return element;
  }

  renderTypingElement() {
    const {
      typingUsers, indicatorEnabled,
    } = this.props;

    if (!indicatorEnabled || !typingUsers) return null;

    const { length } = typingUsers;
    const isSingleTyper = length === 1;
    const isCoupleTypers = length === 2;
    const isFewTypers = length === 3;

    const names = typingUsers.map((user, index) => {
      const domElement = [];
      const style = {};
      style[styles.typingUser] = true;
      style[styles.twoUsers] = isCoupleTypers;
      style[styles.threeUsers] = isFewTypers;
      domElement.push(<span key={_.uniqueId('typing-users-')} className={cx(style)}>{`${user.name}`}</span>);

      if (isSingleTyper) return domElement;

      const addComma = (isCoupleTypers || isFewTypers) && index !== (typingUsers.length - 1);

      if (addComma) {
        domElement.push(
          <span key={_.uniqueId('spacer-comma-')}>
            {','}
            &nbsp;
          </span>,
        );
      }

      return domElement;
    });

    if (names.length === 0) return null;
    if (isSingleTyper) return this.renderAnimation(names, 'single');
    if (isCoupleTypers || isFewTypers) return this.renderAnimation(names);
    return this.renderAnimation();
  }

  render() {
    const {
      error,
    } = this.props;

    const style = {};
    style[styles.error] = !!error;
    style[styles.info] = !error;
    style[styles.spacer] = !!this.renderTypingElement();

    return (
      <div className={cx(style)}>
        <span className={styles.typingIndicator}>{error || this.renderTypingElement()}</span>
      </div>
    );
  }
}

TypingIndicator.propTypes = propTypes;

export default injectIntl(TypingIndicator);
