import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { styles } from './styles.scss';

const COLORS = [
  'default', 'primary', 'danger', 'success',
];

const propTypes = {
  children: PropTypes.string.isRequired,
  color: PropTypes.oneOf(COLORS),
};

const defaultProps = {
  color: 'default',
};

const NotificationsBar = (props) => {
  const { color } = props;

  return (
    <div
      role="alert"
      className={cx(styles.notificationsBar, styles[color])}
    >
      {props.children}
    </div>
  );
};

NotificationsBar.propTypes = propTypes;
NotificationsBar.defaultProps = defaultProps;

export default injectWbResizeEvent(NotificationsBar);
