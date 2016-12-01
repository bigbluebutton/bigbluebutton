import React from 'react';
import Button from '/imports/ui/components/button/component';
import { clearModal } from '/imports/ui/components/app/service';
import { joinListenOnly } from '/imports/api/phone';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import styles from '../styles.scss';

import StreamVolume from '/imports/ui/components/stream-volume/component';
import EnterAudio from '/imports/ui/components/enter-audio/component';
import SpeakerSource from '/imports/ui/components/speaker-source/component';

export default class ListenOnly extends React.Component {
  constructor(props) {
    super(props);

    this.chooseAudio = this.chooseAudio.bind(this);
  }

  chooseAudio() {
    this.props.changeMenu(this.props.JOIN_AUDIO);
  }

  joinListen() {
    joinListenOnly();
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
          <div className={styles.half}>
            <StreamVolume />
            <SpeakerSource />
          </div>
          <div className={styles.half}>
          <EnterAudio />
          </div>
        </div>
      </div>
    );
  }
};
