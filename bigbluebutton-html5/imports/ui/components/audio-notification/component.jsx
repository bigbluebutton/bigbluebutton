import React, { Component, PropTypes } from 'react';
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

export default class AudioNotification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notification: null,
    }
    this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
    this.props.handleClose();
  }

  render() {
    const { color, message } = this.props;

    if(!color || !message || this.state.notification === 'closed'){
      return null;
    }else{
      return (
        <div
          role="alert"
          className={cx(styles.audioNotifications, styles[this.props.color])}>
          {message}
          <Button className={styles.closeBtn}
            label={'Close'}
            icon={'close'}
            size={'sm'}
            circle={true}
            hideLabel={true}
            onClick={this.handleClose}
          />
        </div>
      );
    }
  }
}

AudioNotification.propTypes = propTypes;
AudioNotification.defaultProps = defaultProps;
