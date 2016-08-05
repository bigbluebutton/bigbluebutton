import React, { Component } from 'react';
import styles from './styles.scss';

import Icon from '../icon/component';

class KickedScreen extends Component {
  render() {
    return (
      <div className={styles.background}>
        <Icon iconName="sad" className={styles.icon}/>
        <div className={styles.message}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
export default KickedScreen;
