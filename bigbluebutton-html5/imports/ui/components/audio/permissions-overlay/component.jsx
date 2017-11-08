import React, { Component } from 'react';
import styles from './styles';

export default class PermissionsOverlay extends Component {
  render() {
    return (
      <div className={styles.overlay}>
        <div className={styles.hint}>
          Allow BigBlueButton to use your Microphone
          <small>
            We need you to allow us to use your microphone in order to join you to the voice conference :)
          </small>
        </div>
      </div>
    )
  }
}
