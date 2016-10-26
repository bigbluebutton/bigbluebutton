import React from 'react';
import Button from '/imports/ui/components/button/component';
import { clearModal } from '/imports/ui/components/app/service';
import { joinMicrophone } from '/imports/api/phone';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import { callServer } from '/imports/ui/services/api';
import styles from '../styles.scss';

export default class AudioSettings extends React.Component {
  constructor(props) {
    super(props);

    this.chooseAudio = this.chooseAudio.bind(this);
    this.joinAudio = this.joinAudio.bind(this);
  }

  handleClick() {
  }

  chooseAudio() {
    this.props.changeMenu(this.props.JOIN_AUDIO);
  }

  joinAudio() {
    clearModal();
    joinMicrophone();
  }


  render() {
    return (
      <div>
        <div className={styles.center}>
          <Button className={styles.backBtn}
            label={'Back'}
            icon={'left-arrow'}
            size={'md'}
            color={'primary'}
            ghost={true}
            onClick={this.chooseAudio}
          />
          <div>
            Choose your audio settings
          </div>
        </div>
        <div className={styles.half}>
          <label htmlFor='microphone'>Microphone source</label><br />
          <select id='microphone' defaultValue='0'>
            <option value='0' disabled>Default</option>
            <option value='1' disabled>1</option>
            <option value='2' disabled>2</option>
            <option value='3' disabled>3</option>
          </select><br />
          <label htmlFor='speaker'>Speaker source</label><br />
          <select id='speaker' defaultValue='0'>
            <option value='0' disabled>Default</option>
            <option value='1' disabled>1</option>
            <option value='2' disabled>2</option>
            <option value='3' disabled>3</option>
          </select><br />
          <Button className={styles.playSound}
            label={'Play sound'}
            icon={'audio'}
            size={'md'}
            color={'primary'}
            ghost={true}
            onClick={this.handleClick}
          /><br />
        </div>
        <div className={styles.half}>
          Please note, a dialog will appear in your browser,
          requiring you to accept your microphone.
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
      </div>
    );
  }
};
