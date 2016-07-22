import React, { Component, PropTypes } from 'react';
import styles from '../styles.scss';
import Meetings from '/imports/api/meetings';

export default class RecordButton extends Component{
  constructor(props) {
    super(props);
  }

  render() {
    const { beingRecorded } = this.props;
    let fillColor = beingRecorded ? '#F0615F' : '#ffffff';

    return (
      <svg width="30" height="30" className={styles.recordImage}>
        <circle cx="13" cy="17" r="10" stroke="#ffffff" strokeWidth="1" fill="#2A2D36" />
        <circle cx="13" cy="17.5" r="5" stroke="#2A2D36" strokeWidth="1" fill= {fillColor} />
      </svg>
    );
  }
};
