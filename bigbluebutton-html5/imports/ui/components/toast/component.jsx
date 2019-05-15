import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import cx from 'classnames';
import Icon from '../icon/component';
import { styles } from './styles';

const propTypes = {
  icon: PropTypes.string,
  message: PropTypes.node.isRequired,
  type: PropTypes.oneOf(Object.values(toast.TYPE)).isRequired,
};

const defaultProps = {
  icon: null,
};

const defaultIcons = {
  [toast.TYPE.INFO]: 'help',
  [toast.TYPE.SUCCESS]: 'checkmark',
  [toast.TYPE.WARNING]: 'warning',
  [toast.TYPE.ERROR]: 'close',
  [toast.TYPE.DEFAULT]: 'about',
};

const Toast = ({
  icon,
  type,
  message,
  content,
  small,
}) => (
  <div
    className={cx(styles.toastContainer, small ? styles.smallToastContainer : null)}
  >
    <div className={styles[type]}>
      <div className={cx(styles.icon, small ? styles.smallIcon : null)}>
        <Icon iconName={icon || defaultIcons[type]} />
      </div>
      <div className={cx(styles.message, small ? styles.smallMessage : null)}>
        <span>{message}</span>
      </div>
    </div>
    {content
      ? (
        <div className={styles.backgroundColorInherit}>
          <div className={styles.separator} />
          <div className={styles.backgroundColorInherit}>
            {content}
          </div>
        </div>
      ) : null
    }
  </div>
);

export default Toast;

Toast.propTypes = propTypes;
Toast.defaultProps = defaultProps;
