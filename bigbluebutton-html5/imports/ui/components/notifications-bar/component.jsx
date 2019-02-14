import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { styles } from './styles.scss';

const COLORS = [
  'default', 'primary', 'danger', 'success',
];

const propTypes = {
  color: PropTypes.oneOf(COLORS),
};

const defaultProps = {
  color: 'default',
};

const isTimedAlert = (alertString) => {
  // checks if the notification string contains a timer
  const endsWithTime = alertString.match(/[0-9]*:[0-9]{2}$/i);
  const hasCounter = alertString.match(/[ ][0-9]*[ ]/i);
  return !!(hasCounter || endsWithTime);
};

const NotificationsBar = (props) => {
  const { color, children } = props;

  return (
    <div
      role={isTimedAlert(children) ? '' : 'alert'}
      className={cx(styles.notificationsBar, styles[color])}
    >
      {children}
    </div>
  );
};

NotificationsBar.propTypes = propTypes;
NotificationsBar.defaultProps = defaultProps;

export default injectWbResizeEvent(NotificationsBar);
