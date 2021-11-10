import React from 'react';
import { ToastContainer as Toastify } from 'react-toastify';

import { styles } from './styles.scss';
import Styled from './styles';
import Settings from '/imports/ui/services/settings';

class ToastContainer extends React.Component {
  // we never want this component to update since will break Toastify
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { animations } = Settings.application;

    return (
      <Toastify
        closeButton={(<Styled.CloseIcon iconName="close" animations={animations} />)}
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
