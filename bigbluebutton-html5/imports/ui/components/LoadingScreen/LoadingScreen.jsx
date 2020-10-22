import React from 'react';
import PropTypes from 'prop-types';
import { styles } from './styles.scss';

const LoadingScreen = ({ children }) => (
  <div className={styles.background}>
    <div className={styles.spinner}>
      <div className={styles.bounce1} />
      <div className={styles.bounce2} />
      <div />
    </div>
    <div className={styles.message}>
      {children}
    </div>
  </div>
);

LoadingScreen.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LoadingScreen;
