import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import styles from '../styles.scss';
import {joinListenOnly, joinMicrophone, exitAudio} from '/imports/api/phone';

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
          <label htmlFor='microphone'>Microphone source</label>
        </div>
        <div className={styles.containerRightHalf}>
          <label htmlFor='audioVolume'>Your audio stream volume</label>
        </div>
        <div className={styles.containerLeftHalfContent} role='presentation'>
          <select id='microphone' defaultValue='0' tabIndex='7' role='listbox'
            aria-labelledby='micLabel' aria-describedby='micDesc'>
            <option value='0' disabled>Displace Audio</option>
            <option value='1' role='option'>audio 1</option>
            <option value='2' role='option'>audio 2</option>
            <option value='3' role='option'>audio 3</option>
          </select>
          <div id='micLabel' hidden>Select microphone source</div>
          <div id='micDesc' hidden>
            Chooses a microphone source from the dropdown menu.</div>
        </div>
        <div className={styles.containerRightHalfContent}>
          <input style={{ width: '90%' }} type='text' placeholder='volume bar placeholder'
            tabIndex='-1' />
        </div>
        <div className={styles.containerLeftHalf}>
          <label htmlFor='speaker'>Speaker source</label>
        </div>
        <div className={styles.containerRightHalf}><br/></div>
        <div className={styles.containerLeftHalfContent} role='presentation'>
          <select id='speaker' defaultValue='0' tabIndex='8' role='listbox'
            aria-labelledby='spkrLabel' aria-describedby='spkrDesc'>
            <option value='0' disabled>Displace Audio</option>
            <option value='1' role='option'>audio 1</option>
            <option value='2' role='option'>audio 2</option>
            <option value='3' role='option'>audio 3</option>
          </select>
          <div id='spkrLabel' hidden>Select speaker source</div>
          <div id='spkrDesc' hidden>
            Chooses a speaker source from the dropdown menu.</div>
        </div>
        <div className={styles.containerRightHalfContent} role='presentation'>
          <Button className={styles.testAudioBtn}
            onClick={this.testAudio}
            label={'Test Audio'}
            color={'primary'}
            ghost={true}
            icon={'audio'}
            tabIndex={9}
            aria-labelledby={'testAudioLabel'}
            aria-describedby={'testAudioDesc'}
          />
        <div id='testAudioLabel' hidden>Test audio</div>
        <div id='testAudioDesc' hidden>
          Previews the audio output of your microphone.</div>
        </div>
      </div>
    );
  }
};
