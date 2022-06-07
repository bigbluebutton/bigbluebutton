import React from 'react';
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

export default LoadingScreen;
