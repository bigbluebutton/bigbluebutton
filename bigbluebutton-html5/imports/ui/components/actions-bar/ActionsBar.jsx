import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';

export default class ActionsBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.actionsbar}>
        ACTIONS BAR
      </div>
    );
  }
}
