import React from 'react';
import Button from '/imports/ui/components/button/component';
import { clearModal } from '/imports/ui/components/app/service';
import { joinMicrophone } from '/imports/api/phone';
import styles from '../styles.scss';

import MicSource from '/imports/ui/components/mic-source/component';
import SpeakerSource from '/imports/ui/components/speaker-source/component';
import EnterAudio from '/imports/ui/components/enter-audio/component';

export default class AudioSettings extends React.Component {
  constructor(props) {
    super(props);

    this.chooseAudio = this.chooseAudio.bind(this);
    this.joinAudio = this.joinAudio.bind(this);
  }

  handleClick() {
  }

  playAudioSample() {
    const snd = new Audio('resources/sounds/audioSample.mp3');
    snd.play();
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
          <MicSource />
          <SpeakerSource />
        </div>
        <div className={styles.half}>
          <EnterAudio />
        </div>
      </div>
    );
  }
};
