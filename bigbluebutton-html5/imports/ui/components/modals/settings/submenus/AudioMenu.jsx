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
      <div style={{ height: '100%', width: '100%' }}>
        <div className={styles.containerLeftHalf}>
          <label for='microphone'>Microphone source</label>
        </div>
        <div className={styles.containerRightHalf}>
          <label for='audioVolume'>Your audio stream volume</label>
        </div>
        <div style={{ height: '20%' }} className={styles.containerLeftHalf}>
          <select id='microphone' defaultValue='0'>
            <option value='0' disabled>Displace Audio</option>
            <option value='1'>audio 1</option>
            <option value='2'>audio 2</option>
            <option value='3'>audio 3</option>
          </select>
        </div>
        <div style={{ height: '20%' }} className={styles.containerRightHalf}>
          <input type='text' placeholder='volume bar placeholder' style={{ width: '90%' }}></input>
        </div>
        <div className={styles.containerLeftHalf}><label for='speaker'>Speaker source</label></div>
        <div className={styles.containerRightHalf}><br/></div>
        <div style={{ height: '20%' }} className={styles.containerLeftHalf}>
          <select id='speaker' defaultValue='0'>
            <option value='0' disabled>Displace Audio</option>
            <option value='1'>audio 1</option>
            <option value='2'>audio 2</option>
            <option value='3'>audio 3</option>
          </select>
        </div>
        <div style={{ height: '20%' }} className={styles.containerRightHalf}>
          <Button style={{ borderRadius: '18px', width: '140px', borderStyle: 'none',
            boxShadow: 'none', float: 'left', }}
            label={'Test Audio'}
            color={'primary'}
            ghost={true}
            icon={'audio'}
            onClick={joinVoiceCall.bind(this, { useSIPAudio, isListenOnly })}
          />
        </div>
      </div>
    );
  }
};
