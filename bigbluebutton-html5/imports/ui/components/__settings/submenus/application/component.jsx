import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import ReactDOM from 'react-dom';
import styles from '../styles.scss';

export default class ApplicationMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div className={styles.full} role='presentation'>
          <div className={styles.row} role='presentation'>
            <label><input type='checkbox' tabIndex='7' aria-labelledby='audioNotifLabel'
              aria-describedby='audioNotifDesc' />Audio notifications for chat</label>
            <div id='audioNotifLabel' hidden>Audio notifications</div>
            <div id='audioNotifDesc' hidden>
              Toggles the audio notifications for chat.</div>
          </div>
          <div className={styles.row} role='presentation'>
            <label><input type='checkbox' tabIndex='8' aria-labelledby='pushNotifLabel'
              aria-describedby='pushNotifDesc' />Push notifications for chat</label>
            <div id='pushNotifLabel' hidden>Push notifications</div>
            <div id='pushNotifDesc' hidden>
              Toggles the push notifications for chat.</div>
          </div>
        <div className={styles.applicationFontContainer} role='presentation'>
          <div className={styles.fontBarLeft}>
            <p>Font size</p>
          </div>
          <div className={styles.fontBarMid}>
            <p>{this.props.handleGetFontSizeName()}</p>
          </div>
          <div className={styles.fontBarRight} role='presentation'>
            <Button
              onClick={this.props.handleIncreaseFontSize}
              icon={'circle-add'}
              circle={true}
              tabIndex={9}
              hideLabel={true}
              label={'Increase Font'}
              aria-labelledby={'sizeUpLabel'}
              aria-describedby={'sizeUpDesc'}
            />
            <div id='sizeUpLabel' hidden>Font size up</div>
            <div id='sizeUpDesc' hidden>
              Increases the font size of the application.</div>
            <Button
              onClick={this.props.handleDecreaseFontSize}
              icon={'circle-minus'}
              circle={true}
              tabIndex={10}
              hideLabel={true}
              label={'Decrease Font'}
              aria-labelledby={'sizeDownLabel'}
              aria-describedby={'sizeDownDesc'}
            />
          <div id='sizeDownLabel' hidden>Font size down</div>
          <div id='sizeDownDesc' hidden>
            Decreases the font size of the application.</div>
          </div>
        </div>
      </div>
    );
  }
};
