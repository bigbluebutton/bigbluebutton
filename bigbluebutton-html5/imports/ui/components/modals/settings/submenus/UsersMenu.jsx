import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import styles from './styles';

export default class UsersMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div style={{ height: '100%' }} role='presentation'>
        <div style={{ height: '15%' }} role='presentation'>
          <label><input type='checkbox' tabIndex='8' aria-labelledby='muteALlLabel'
            aria-describedby='muteAllDesc' />Mute all except the presenter</label>
        </div>
        <div className={styles.hidden} id='muteAllLabel'>Mute all</div>
        <div className={styles.hidden} id='muteAllDesc'>
          Mutes all participants except the presenter.</div>

        <div style={{ height: '15%' }} role='presentation'>
          <label><input type="checkbox" tabIndex='9' aria-labelledby='lockAllLabel'
            aria-describedby='lockAllDesc' />Lock all participants</label>
        </div>
        <div className={styles.hidden} id='lockAllLabel'>Lock all</div>
        <div className={styles.hidden} id='lockAllDesc'>
          Toggles locked status for all participants.</div>

        <div style={{ height: '15%', paddingLeft: '10%' }} role='presentation'>
          <label><input type='checkbox' tabIndex='10' aria-labelledby='webcamLabel'
            aria-describedby='webcamDesc' />Webcam</label>
        </div>
        <div className={styles.hidden} id='webcamLabel'>Webcam lock</div>
        <div className={styles.hidden} id='webcamDesc'>
          Disables the webcam for all locked participants.</div>

        <div style={{ height: '15%', paddingLeft: '10%' }} role='presentation'>
          <label><input type='checkbox' tabIndex='11' aria-labelledby='micLabel'
            aria-describedby='micDesc' />Microphone</label>
        </div>
        <div className={styles.hidden} id='micLabel'>Microphone lock</div>
        <div className={styles.hidden} id='micDesc'>
          Disables the microphone for all locked participants.</div>

        <div style={{ height: '15%', paddingLeft: '10%' }} role='presentation'>
          <label><input type='checkbox' tabIndex='12' aria-labelledby='pubChatLabel'
            aria-describedby='pubChatDesc' />Public chat</label>
        </div>
        <div className={styles.hidden} id='pubChatLabel'>Public chat lock</div>
        <div className={styles.hidden} id='pubChatDesc'>
          Disables public chat for all locked participants.</div>

        <div style={{ height: '15%', paddingLeft: '10%' }} role='presentation'>
          <label><input type='checkbox' tabIndex='13' aria-labelledby='privChatLabel'
            aria-describedby='privChatDesc' />Private chat</label>
        </div>
        <div className={styles.hidden} id='privChatLabel'>Private chat lock</div>
        <div className={styles.hidden} id='privChatDesc'>
          Disables private chat for all locked participants.</div>
      </div>
    );
  }
};
