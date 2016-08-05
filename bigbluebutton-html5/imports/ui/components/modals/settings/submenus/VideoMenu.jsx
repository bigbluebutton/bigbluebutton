import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import styles from './styles';

export default class VideoMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div style={{ height: '100%' }} role='presentation'>
        <div className={styles.containerLeftHalf}>
          <label htmlFor='camera'>Select camera</label>
        </div>
        <div className={styles.containerRightHalf}>
          <label htmlFor='quality'  >Video quality</label>
        </div>
        <div style={{ height: '20%' }} className={styles.containerLeftHalf} role='presentation'>
          <select id='camera' defaultValue='0' tabIndex='7'
            aria-labelledby='camLabel' aria-describedby='camDesc'>
            <option value='0' disabled>Select camera</option>
            <option value='1'>Camera 1</option>
            <option value='2'>Camera 2</option>
            <option value='3'>Camera 3</option>
          </select>
          <div className={styles.hidden} id='camLabel'>Camera source</div>
          <div className={styles.hidden} id='camDesc'>
            Chooses a camera source from the dropdown menu.</div>
        </div>
        <div style={{ height: '20%' }} className={styles.containerRightHalf} role='presentation'>
          <select id='quality' defaultValue='0' tabIndex='8'
            aria-labelledby='vidLabel' aria-describedby='vidDesc'>
            <option value='0' disabled>Select quality</option>
            <option value='1'>Low</option>
            <option value='2'>Medium</option>
            <option value='3'>High</option>
          </select>
          <div className={styles.hidden} id='vidLabel'>Video quality</div>
          <div className={styles.hidden} id='vidDesc'>
            Chooses the video quality level from the dropdown menu.</div>
        </div>
        <div className={styles.containerLeftHalf}>
          <p style={{ margin: '0px' }}>Viewing participants webcams</p>
        </div>
      </div>
    );
  }
};
