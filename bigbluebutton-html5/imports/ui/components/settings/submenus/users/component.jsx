import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import styles from '../styles.scss';

export default class UsersMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div className={styles.full} role='presentation'>
        <div className={styles.row} role='presentation'>
          <label><input className={styles.checkboxOffset} type='checkbox' tabIndex='7'
          aria-labelledby='muteALlLabel' aria-describedby='muteAllDesc' />
          Mute all except the presenter</label>
        </div>
        <div id='muteAllLabel' hidden>Mute all</div>
        <div id='muteAllDesc' hidden>Mutes all participants except the presenter.</div>

        <div className={styles.row} role='presentation'>
          <label><input className={styles.checkboxOffset} type="checkbox" tabIndex='8'
          aria-labelledby='lockAllLabel' aria-describedby='lockAllDesc' />
          Lock all participants</label>
        </div>
        <div id='lockAllLabel' hidden>Lock all</div>
        <div id='lockAllDesc' hidden>Toggles locked status for all participants.</div>

        <div className={styles.indentedRow} role='presentation'>
          <label><input className={styles.checkboxOffset} type='checkbox' tabIndex='9'
          aria-labelledby='webcamLabel' aria-describedby='webcamDesc' />Webcam</label>
        </div>
        <div id='webcamLabel' hidden>Webcam lock</div>
        <div id='webcamDesc' hidden>Disables the webcam for all locked participants.</div>

        <div className={styles.indentedRow} role='presentation'>
          <label><input className={styles.checkboxOffset} type='checkbox' tabIndex='10'
          aria-labelledby='micLabel' aria-describedby='micDesc' />Microphone</label>
        </div>
        <div id='micLabel' hidden>Microphone lock</div>
        <div id='micDesc' hidden>Disables the microphone for all locked participants.</div>

        <div className={styles.indentedRow} role='presentation'>
          <label><input className={styles.checkboxOffset} type='checkbox' tabIndex='11'
          aria-labelledby='pubChatLabel' aria-describedby='pubChatDesc' />Public chat</label>
        </div>
        <div id='pubChatLabel' hidden>Public chat lock</div>
        <div id='pubChatDesc' hidden>Disables public chat for all locked participants.</div>

        <div className={styles.indentedRow} role='presentation'>
          <label><input className={styles.checkboxOffset} type='checkbox' tabIndex='12'
          aria-labelledby='privChatLabel' aria-describedby='privChatDesc' />Private chat</label>
        </div>
        <div id='privChatLabel' hidden>Private chat lock</div>
        <div id='privChatDesc' hidden>Disables private chat for all locked participants.</div>
      </div>
    );
  }
};
