import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import ReactDOM from 'react-dom';
import FontControl from '/imports/api/FontControl';
import styles from './styles';

export default class ApplicationMenu extends BaseMenu {
  constructor(props) {
    super(props);
    this.state = {
      currentFontSize: FontControl.fontSizeEnum.MEDIUM,
    };
  }

  getContent() {
    return (
      <div style={{ height: '100%' }}>
        <div className={styles.applicationSubmenuContent}>
          <div style={{ height: '20%' }}>
            <label><input type="checkbox" />Audio notifications for chat</label>
          </div>
          <div style={{ height: '20%' }}>
            <label><input type="checkbox" />Push notifications for chat</label>
          </div>
        </div>
        <div className={styles.applicationFontContainer}>
          <div className={styles.fontBarLeft}>
            <p>Font size</p>
          </div>
          <div className={styles.fontBarMid}>
            <p>{FontControl.getFontSizeName.call(this)}</p>
          </div>
          <div className={styles.fontBarRight}>
            <Button
              onClick = {FontControl.increaseFontSize.bind(this)}
              icon = {'circle-add'}
              circle = {true}
            />
            <Button
              onClick = {FontControl.decreaseFontSize.bind(this)}
              icon = {'circle-minus'}
              circle = {true}
            />
          </div>
        </div>
      </div>
    );
  }
};
