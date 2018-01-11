import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

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

const Toast = ({ icon, type, message }) => (
  <div className={styles[type]}>
    <div className={styles.icon}><Icon iconName={icon || defaultIcons[type]} /></div>
    <div className={styles.message}>
      <span>{message}</span>
    </div>
  </div>
);

export default Toast;

Toast.propTypes = propTypes;
Toast.defaultProps = defaultProps;
