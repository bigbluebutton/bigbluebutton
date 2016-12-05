import React from 'react';
import BaseMenu from '../base/component';
import styles from '../styles.scss';

import MicSource from '../../../mic-source/component';
import SpeakerSource from '../../../speaker-source/component';
import StreamVolume from '../../../stream-volume/component';
import AudioTest from '../../../audio-test/component';

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
          <AudioTest />
        </div>
      </div>
    );
  }
};
