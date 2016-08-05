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
      <div style={{ height: '100%' }} role='presentation'>
          <div style={{ height: '15%' }} role='presentation'>
            <label><input type='checkbox' tabIndex='8' aria-labelledby='audioNotifLabel'
              aria-describedby='audioNotifDesc' />Audio notifications for chat</label>
            <div className={styles.hidden} id='audioNotifLabel'>Audio notifications</div>
            <div className={styles.hidden} id='audioNotifDesc'>
              Toggles the audio notifications for chat.</div>
          </div>
          <div style={{ height: '15%' }} role='presentation'>
            <label><input type='checkbox' tabIndex='9' aria-labelledby='pushNotifLabel'
              aria-describedby='pushNotifDesc' />Push notifications for chat</label>
            <div className={styles.hidden} id='pushNotifLabel'>Push notifications</div>
            <div className={styles.hidden} id='pushNotifDesc'>
              Toggles the push notifications for chat.</div>
          </div>
        <div className={styles.applicationFontContainer} role='presentation'>
          <div className={styles.fontBarLeft}>
            <p>Font size</p>
          </div>
          <div className={styles.fontBarMid}>
            <p>{FontControl.getFontSizeName.call(this)}</p>
          </div>
          <div className={styles.fontBarRight} role='presentation'>
            <Button
              onClick={FontControl.increaseFontSize.bind(this)}
              icon={'circle-add'}
              circle={true}
              tabIndex={10}
              hideLabel={true}
              label={'Increase Font'}
              aria-labelledby={'sizeUpLabel'}
              aria-describedby={'sizeUpDesc'}
            />
            <div className={styles.hidden} id='sizeUpLabel'>Font size up</div>
            <div className={styles.hidden} id='sizeUpDesc'>
              Increases the font size of the application.</div>
            <Button
              onClick={FontControl.decreaseFontSize.bind(this)}
              icon={'circle-minus'}
              circle={true}
              tabIndex={11}
              hideLabel={true}
              label={'Decrease Font'}
              aria-labelledby={'sizeDownLabel'}
              aria-describedby={'sizeDownDesc'}
            />
          <div className={styles.hidden} id='sizeDownLabel'>Font size down</div>
          <div className={styles.hidden} id='sizeDownDesc'>
            Decreases the font size of the application.</div>
          </div>
        </div>
      </div>
    );
  }
};
