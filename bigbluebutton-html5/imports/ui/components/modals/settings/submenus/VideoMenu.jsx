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
      <div style={{ height: '100%' }}>
        <div className={styles.containerLeftHalf}><label for='camera'>Select camera</label></div>
        <div className={styles.containerRightHalf}><label for='quality'>Video quality</label></div>
        <div style={{ height: '20%' }} className={styles.containerLeftHalf}>
          <select id='camera' defaultValue='0'>
            <option value='0' disabled>Select camera</option>
            <option value='1'>Camera 1</option>
            <option value='2'>Camera 2</option>
            <option value='3'>Camera 3</option>
          </select>
        </div>
        <div style={{ height: '20%' }} className={styles.containerRightHalf}>
          <select id='quality' defaultValue='0'>
            <option value='0' disabled>Select quality</option>
            <option value='1'>Low</option>
            <option value='2'>Medium</option>
            <option value='3'>High</option>
          </select>
        </div>
        <div className={styles.containerLeftHalf}><p>Viewing participants webcams</p></div>
        <div className={styles.containerRightHalf}>
          <Button style = {{ borderRadius: '18px', width: '90px', float: 'right',
            border: 'none', boxShadow: 'none', }}
            label={'Done'}
            color={'primary'}
            onClick={this.closeModal}
          />
        </div>
      </div>
    );
  }
};
