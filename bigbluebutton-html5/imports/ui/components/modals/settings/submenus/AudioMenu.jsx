import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import styles from './styles';
import {joinVoiceCall, exitVoiceCall} from '/imports/api/phone';

export default class AudioMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div style={{ height: '100%', width: '100%'}} role='presentation'>
        <div className={styles.containerLeftHalf}>
          <label for='microphone'>Microphone source</label>
        </div>
        <div className={styles.containerRightHalf}>
          <label for='audioVolume'>Your audio stream volume</label>
        </div>
        <div style={{ height: '20%' }} className={styles.containerLeftHalf} role='presentation'>
          <select id='microphone' defaultValue='0' tabIndex='8' role='listbox' aria-labelledby='micLabel' aria-describedby='micDesc'>
            <option value='0' disabled>Displace Audio</option>
            <option value='1' role='option'>audio 1</option>
            <option value='2' role='option'>audio 2</option>
            <option value='3' role='option'>audio 3</option>
          </select>
          <div className={styles.hidden} id='micLabel'>Select microphone source</div>
          <div className={styles.hidden} id='micDesc'>Chooses a microphone source from the dropdown menu.</div>
        </div>
        <div style={{ height: '20%' }} className={styles.containerRightHalf}>
          <input type='text' placeholder='volume bar placeholder' style={{ width: '90%' }} tabIndex='-1'></input>
        </div>
        <div className={styles.containerLeftHalf}>
          <label for='speaker'>Speaker source</label>
        </div>
        <div className={styles.containerRightHalf}><br/></div>
        <div style={{ height: '20%' }} className={styles.containerLeftHalf} role='presentation'>
          <select id='speaker' defaultValue='0' tabIndex='9' role='listbox' aria-labelledby='spkrLabel' aria-describedby='spkrDesc'>
            <option value='0' disabled>Displace Audio</option>
            <option value='1' role='option'>audio 1</option>
            <option value='2' role='option'>audio 2</option>
            <option value='3' role='option'>audio 3</option>
          </select>
          <div className={styles.hidden} id='spkrLabel'>Select speaker source</div>
          <div className={styles.hidden} id='spkrDesc'>Chooses a speaker source from the dropdown menu.</div>
        </div>
        <div style={{ height: '20%' }} className={styles.containerRightHalf} role='presentation'>
          <Button className={styles.testAudioBtn}
            onClick={''}
            label={'Test Audio'}
            color={'primary'}
            ghost={true}
            icon={'audio'}
            tabIndex={10}
            aria-labelledby={'testAudioLabel'}
            aria-describedby={'testAudioDesc'}
          />
        <div className={styles.hidden} id='testAudioLabel'>Test audio</div>
        <div className={styles.hidden} id='testAudioDesc'>Previews the audio output of your microphone.</div>
        </div>
      </div>
    );
  }
};
