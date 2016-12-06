import React from 'react';
import Button from '/imports/ui/components/button/component';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import styles from '../styles.scss';

import StreamVolume from '/imports/ui/components/stream-volume/component';
import SpeakerSource from '/imports/ui/components/speaker-source/component';
import AudioTestContainer from '/imports/ui/components/audio-test/container';
import EnterAudioContainer from '/imports/ui/components/enter-audio/container';

export default class ListenOnly extends React.Component {
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
            Listen only message
          </div>
        </div>
        <div>
          <div className={styles.containerLeftHalfContent}>
            <StreamVolume />
            <SpeakerSource />
            <AudioTestContainer />
          </div>
          <div className={styles.containerRightHalfContent}>
            <EnterAudioContainer isFullAudio={false}/>
          </div>
        </div>
      </div>
    );
  }
};
