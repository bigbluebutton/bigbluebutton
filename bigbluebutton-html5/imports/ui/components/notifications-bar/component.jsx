import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styles from './styles.scss';

const COLORS = [
  'default', 'primary', 'danger', 'success',
];

const propTypes = {
  color: PropTypes.oneOf(COLORS),
};

const defaultProps = {
  color: 'default',
};

export default class NotificationsBar extends Component {

  componentDidMount() {
    // to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));
  }

  componentWillUnmount() {
    // to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));
  }

  render() {
    const { color } = this.props;

    return (
      <div
        role="alert"
        className={cx(styles.notificationsBar, styles[color])}
      >
        {this.props.children}
      </div>
    );
  }
}

NotificationsBar.propTypes = propTypes;
NotificationsBar.defaultProps = defaultProps;
