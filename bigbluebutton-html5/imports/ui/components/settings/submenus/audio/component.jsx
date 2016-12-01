import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import styles from '../styles.scss';
import {joinListenOnly, joinMicrophone, exitAudio} from '/imports/api/phone';

import MicSource from '../../../mic-source/component';
import SpeakerSource from '../../../speaker-source/component';
import StreamVolume from '../../../stream-volume/component';
import EnterAudio from '../../../enter-audio/component';

export default class AudioMenu extends BaseMenu {
  constructor(props) {
    super(props);

    this.testAudio = this.testAudio.bind(this);
  }

  testAudio() {

  }

  getContent() {
    return (
      <div className={styles.full} role='presentation'>
        <div className={styles.containerLeftHalf}>
          <MicSource />
        </div>
        <div className={styles.containerRightHalf}>
          <StreamVolume />
        </div>
        <div className={styles.containerFull}>
          <SpeakerSource />
        </div>
        <div className={styles.containerRightHalf}>
          <EnterAudio />
        </div>
      </div>
    );
  }
};
