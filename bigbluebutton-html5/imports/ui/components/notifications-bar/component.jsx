import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import cx from 'classnames';

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
  constructor(props) {
    super(props);
  }

  render() {
    const { color } = this.props;

    return (
      <div
        role="alert"
        className={cx(styles.notificationsBar, styles[color])}>
        {this.props.children}
      </div>
    );
  }
}

NotificationsBar.propTypes = propTypes;
NotificationsBar.defaultProps = defaultProps;
