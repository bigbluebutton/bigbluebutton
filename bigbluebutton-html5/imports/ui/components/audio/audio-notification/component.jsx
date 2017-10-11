import React, { Component } from 'react';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import PropTypes from 'prop-types';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import styles from './styles.scss';

const COLORS = [
  'default', 'primary', 'danger', 'success',
];

const propTypes = {
  color: PropTypes.oneOf(COLORS),
  intl: intlShape.isRequired,
  message: PropTypes.string,
};

const defaultProps = {
  color: 'danger',
  message: null,
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

    this.state = {
      message: null,
    };

    this.handleClose = this.handleClose.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      message,
    } = nextProps;

    if (this.state.message) {
      return;
    }

    this.setState({
      message,
    });
  }

  handleClose() {
    this.setState({
      message: null,
    });
  }

  render() {
    const {
      intl,
    } = this.props;

    const {
      message,
    } = this.state;

    if (!message) {
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
