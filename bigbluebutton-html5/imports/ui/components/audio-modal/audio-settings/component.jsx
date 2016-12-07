import React from 'react';
import Button from '/imports/ui/components/button/component';
import { clearModal } from '/imports/ui/components/app/service';
import styles from '../styles.scss';

import MicSource from '/imports/ui/components/mic-source/component';
import SpeakerSource from '/imports/ui/components/speaker-source/component';
import EnterAudioContainer from '/imports/ui/components/enter-audio/container';
import StreamVolume from '/imports/ui/components/stream-volume/component';
import AudioTestContainer from '/imports/ui/components/audio-test/container';

export default class AudioSettings extends React.Component {
  constructor(props) {
    super(props);

    this.chooseAudio = this.chooseAudio.bind(this);
  }

  chooseAudio() {
    this.props.changeMenu(this.props.JOIN_AUDIO);
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
        <div className={styles.containerLeftHalfContent}>
          <MicSource />
          <StreamVolume />
          <SpeakerSource />
          <AudioTestContainer />
        </div>
        <div className={styles.containerRightHalfContent}>
          <EnterAudioContainer isFullAudio={true}/>
        </div>
      </div>
    );
  }
};
