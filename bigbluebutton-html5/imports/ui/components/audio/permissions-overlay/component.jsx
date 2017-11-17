import React, { Component } from 'react';
import styles from './styles';

export default class PermissionsOverlay extends Component {
  constructor(props) {
    super(props);

    const styles = {
      'Chrome': {
        top: '145px',
        left: '380px',
      },
      'Firefox': {
        top: '210px',
        left: '385px',
      },
    }

    const browser = window.bowser.name;

    this.state = {
      styles: {
        top: styles[browser].top,
        left: styles[browser].left,
      }
    }

    console.log(this.state);
  }

  render() {
    return (
      <div className={styles.overlay}>
        <div style={this.state.styles} className={styles.hint}>
          Allow BigBlueButton to use your Microphone
          <small>
            We need you to allow us to use your microphone in order to join you to the voice conference :)
          </small>
        </div>
      </div>
    )
  }
}
