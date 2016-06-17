import React, { Component, PropTypes } from 'react';
import styles from '../styles.scss';
import NavBar from '../component';
import Meetings from '/imports/api/meetings';

export default class RecordButton extends Component {

  render() {
    let beingRecorded = Meetings.find().map(meeting => meeting.currentlyBeingRecorded);

    return(
      <svg width="30" height="30" className={styles.recordImage}>
        <circle cx="13" cy="17" r="10" stroke="#ffffff" strokeWidth="1" fill="#2A2D36" />
        {beingRecorded == 'true' ?
          <circle cx="13" cy="17.5" r="5" stroke="#2A2D36" strokeWidth="1" fill="#F0615F" />
        :
          <circle cx="13" cy="17.5" r="5" stroke="#2A2D36" strokeWidth="1" fill="#ffffff" />
        }
      </svg>
    );
  }
};
