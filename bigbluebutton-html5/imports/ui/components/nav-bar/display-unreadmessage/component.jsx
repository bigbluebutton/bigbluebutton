import React, { Component, PropTypes } from 'react';
import styles from '../styles.scss';

export default class DisplayUnreadMessage extends Component{
  constructor(props) {
    super(props);
  }

  render() {
    const { hasUnreadMessages } = this.props;
    let fillColor = hasUnreadMessages ? '#F0615F' : '#ffffff';

    return (
      <svg width="30" height="30" className={styles.msgFlag}>
        <circle cx="13" cy="17.5" r="5" stroke="#2A2D36" strokeWidth="1" fill= {fillColor} />
      </svg>
    );
  }
};
