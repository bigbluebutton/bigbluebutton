import React from 'react';
import { ToastContainer as Toastify } from 'react-toastify';

import Icon from '../icon/component';
import { styles } from './styles';

class ToastContainer extends React.Component {
  // we never want this component to update since will break Toastify
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <Toastify
        closeButton={(<Icon className={styles.close} iconName="close" />)}
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
  }
}

export default ToastContainer;
