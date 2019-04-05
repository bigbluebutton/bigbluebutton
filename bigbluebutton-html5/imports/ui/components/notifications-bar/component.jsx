import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { styles } from './styles.scss';

const COLORS = [
  'default', 'primary', 'danger', 'success',
];

const propTypes = {
  color: PropTypes.string,
};

const defaultProps = {
  color: 'default',
};

const NotificationsBar = (props) => {
  const {
    color,
    children,
    alert,
  } = props;

  const hasColor = COLORS.includes(color);

  return (
    <div
      role={alert ? 'alert' : ''}
      aria-live="off"
      style={
        !hasColor ? {
          backgroundColor: `${color}`,
        } : {}
    }
      className={cx(styles.notificationsBar, hasColor ? styles[color] : null)}
    >
      {children}
    </div>
  );
};

NotificationsBar.propTypes = propTypes;
NotificationsBar.defaultProps = defaultProps;

export default injectWbResizeEvent(NotificationsBar);
