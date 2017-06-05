import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles.scss';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';

const COLORS = [
  'default', 'primary', 'danger', 'success',
];

const propTypes = {
  color: PropTypes.oneOf(COLORS),
  message: PropTypes.string,
};

const defaultProps = {
  color: 'default',
};

const intlMessages = defineMessages({
  closeLabel: {
    id: 'app.audioNotification.closeLabel',
    description: 'Audio notification dismiss label',
  },
});

class AudioNotification extends Component {
  constructor(props) {
    super(props);

    this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
    this.props.handleClose();
  }

  render() {
    const {
      color,
      message,
      intl,
    } = this.props;

    if (!color || !message) {
      return null;
    }
    return (
      <div
        role="alert"
        className={cx(styles.audioNotifications, styles[this.props.color])}
      >
        {message}
        <Button
          className={styles.closeBtn}
          label={intl.formatMessage(intlMessages.closeLabel)}
          icon={'close'}
          size={'sm'}
          circle
          hideLabel
          onClick={this.handleClose}
        />
      </div>
    );
  }
}

AudioNotification.propTypes = propTypes;
AudioNotification.defaultProps = defaultProps;

export default injectIntl(AudioNotification);
