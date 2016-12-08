import React from 'react';
import BaseMenu from '../base/component';
import styles from '../styles.scss';

import MicSource from '../../../mic-source/component';
import SpeakerSource from '../../../speaker-source/component';
import StreamVolume from '../../../stream-volume/component';
import AudioTestContainer from '../../../audio-test/container';

export default class AudioMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div className={styles.full} role='presentation'>
        <div className={styles.containerLeftHalf}>
          <MicSource />
          <SpeakerSource />
        </div>
        <div className={styles.containerRightHalf}>
          <StreamVolume />
          <AudioTestContainer  />
        </div>
      </div>
    );
  }
};
