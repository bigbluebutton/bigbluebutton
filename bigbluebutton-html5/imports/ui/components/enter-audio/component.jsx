import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../settings/styles.scss';
import {joinListenOnly, joinMicrophone} from '/imports/api/phone';

export default class EnterAudio extends React.Component {
  constructor(props) {
    super(props);
  }

  joinAudio() {
    joinListenOnly();
  }

  render() {
    return(
      <div className={styles.half}>
        Please note, a dialog will appear in your browser,
        requiring you to accept sharing your microphone.
        <br />
        <img src='resources/images/allow-mic.png' alt='allow microphone image' width='100%'/>
        <br />
        <Button className={styles.enterBtn}
          label={'Enter Session'}
          size={'md'}
          color={'primary'}
          onClick={this.joinAudio}
        />
      </div>
    );
  }
};
