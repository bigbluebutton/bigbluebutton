import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import styles from '../styles.scss';
import Toggle from '/imports/ui/components/switch/component';

const MIN_FONTSIZE = 0;
const MAX_FONTSIZE = 4;

export default class ApplicationMenu extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'application',
      settings: props.settings,
    };
  }

  handleUpdateFontSize(size) {
    let obj = this.state;
    obj.settings.fontSize = size;
    this.setState(obj);
    this.handleUpdateSettings(this.state.settingsName, obj.settings);
  }

  setHtmlFontSize(size) {
    document.getElementsByTagName('html')[0].style.fontSize = size;
  };

  changeFontSize(size) {
    let obj = this.state;
    obj.settings.fontSize = size;
    this.setState(obj, () => {
      this.setHtmlFontSize(this.state.settings.fontSize);
      this.handleUpdateFontSize(this.state.settings.fontSize);
    });
  }

  handleIncreaseFontSize() {
    const currentFontSize = this.state.settings.fontSize;
    const availableFontSizes = this.props.fontSizes;
    const canIncreaseFontSize = availableFontSizes.indexOf(currentFontSize) < MAX_FONTSIZE;
    let fs = (canIncreaseFontSize) ? availableFontSizes.indexOf(currentFontSize) + 1 : MAX_FONTSIZE;
    this.changeFontSize(availableFontSizes[fs]);
  };

  handleDecreaseFontSize() {
    const currentFontSize = this.state.settings.fontSize;
    const availableFontSizes = this.props.fontSizes;
    const canDecreaseFontSize = availableFontSizes.indexOf(currentFontSize) > MIN_FONTSIZE;
    let fs = (canDecreaseFontSize) ? availableFontSizes.indexOf(currentFontSize) - 1 : MIN_FONTSIZE;
    this.changeFontSize(availableFontSizes[fs]);
  };

  render() {
    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>Application</h3>
        </div>
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Audio notifications for chat
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Toggle
                icons={false}
                defaultChecked={this.state.settings.chatAudioNotifications}
                onChange={() => this.handleToggle('chatAudioNotifications')} />
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Push notifications for chat
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Toggle
                icons={false}
                defaultChecked={this.state.settings.chatPushNotifications}
                onChange={() => this.handleToggle('chatPushNotifications')} />
              </div>
            </div>
          </div>
          <hr className={styles.separator}/>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Font size
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                <label className={cx(styles.label, styles.bold)}>
                  {this.props.fontSizes[this.state.settings.fontSize]}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Button
                onClick={() => this.handleIncreaseFontSize()}
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
                onClick={() => this.handleDecreaseFontSize()}
                icon={'circle-minus'}
                circle={true}
                tabIndex={10}
                hideLabel={true}
                label={'Decrease Font'}
                aria-labelledby={'sizeDownLabel'}
                aria-describedby={'sizeDownDesc'}
              />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
