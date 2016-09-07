import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import styles from '../styles.scss';

export default class VideoMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div className={styles.full} role='presentation'>
        <div className={styles.containerLeftHalf}>
          <label htmlFor='camera'>Select camera</label>
        </div>
        <div className={styles.containerRightHalf}>
          <label htmlFor='quality'  >Video quality</label>
        </div>
        <div className={styles.containerLeftHalfContent} role='presentation'>
          <select id='camera' defaultValue='0' tabIndex='7'
            aria-labelledby='camLabel' aria-describedby='camDesc'>
            <option value='0' disabled>Select camera</option>
            <option value='1'>Camera 1</option>
            <option value='2'>Camera 2</option>
            <option value='3'>Camera 3</option>
          </select>
          <div id='camLabel' hidden>Camera source</div>
          <div id='camDesc' hidden>
            Chooses a camera source from the dropdown menu.</div>
        </div>
        <div className={styles.containerRightHalfContent} role='presentation'>
          <select id='quality' defaultValue='0' tabIndex='8'
            aria-labelledby='vidLabel' aria-describedby='vidDesc'>
            <option value='0' disabled>Select quality</option>
            <option value='1'>Low</option>
            <option value='2'>Medium</option>
            <option value='3'>High</option>
          </select>
          <div id='vidLabel' hidden>Video quality</div>
          <div id='vidDesc' hidden>
            Chooses the video quality level from the dropdown menu.</div>
        </div>
        <div className={styles.row}>
          <div>Viewing participants webcams</div>
        </div>
      </div>
    );
  }
};
