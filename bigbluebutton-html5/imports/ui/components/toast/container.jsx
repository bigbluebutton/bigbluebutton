import React from 'react';

import { ToastContainer } from 'react-toastify';

import Icon from '../icon/component';
import styles from './styles';

export default () => (
  <ToastContainer
    closeButton={<Icon className={styles.close} iconName="close" />}
    autoClose={5000}
    className={styles.container}
    toastClassName={styles.toast}
    bodyClassName={styles.body}
    progressClassName={styles.progress}
    newestOnTop={false}
    hideProgressBar={false}
    closeOnClick
    pauseOnHover
  />
);
