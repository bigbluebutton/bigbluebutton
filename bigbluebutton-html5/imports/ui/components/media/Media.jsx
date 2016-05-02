import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import styles from './styles.scss';

export default class Media extends Component {
  render() {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          Welcome! Your presentation will begin shortly...
        </div>
        <div className={styles.side}>
          Here will be side media (webcams)
        </div>
      </div>
    );
  }
}
