import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import styles from '../styles.scss';
import Toggle from '/imports/ui/components/switch/component';
import { defineMessages, injectIntl } from 'react-intl';

const MIN_FONTSIZE = 0;
const MAX_FONTSIZE = 4;

const intlMessages = defineMessages({
  applicationSectionTitle: {
    id: 'app.submenu.application.applicationSectionTitle',
    description: 'Application section title',
  },
  audioNotifyLabel: {
    id: 'app.submenu.application.audioNotifyLabel',
    description: '',
  },
  pushNotifyLabel: {
    id: 'app.submenu.application.pushNotifyLabel',
    description: '',
  },
  fontSizeControlLabel: {
    id: 'app.submenu.application.fontSizeControlLabel',
    description: '',
  },
  increaseFontBtnLabel: {
    id: 'app.submenu.application.increaseFontBtnLabel',
    description: '',
  },
  increaseFontBtnDesc: {
    id: 'app.submenu.application.increaseFontBtnDesc',
    description: '',
  },
  decreaseFontBtnLabel: {
    id: 'app.submenu.application.decreaseFontBtnLabel',
    description: '',
  },
  decreaseFontBtnDesc: {
    id: 'app.submenu.application.decreaseFontBtnDesc',
    description: '',
  },
});

class ApplicationMenu extends BaseMenu {
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
    const { intl } = this.props;

    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.applicationSectionTitle)}</h3>
        </div>
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.audioNotifyLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)} aria-label={intl.formatMessage(intlMessages.audioNotifyLabel)}>
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
                  {intl.formatMessage(intlMessages.pushNotifyLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Toggle
                icons={false}
                defaultChecked={this.state.settings.chatPushNotifications}
                onChange={() => this.handleToggle('chatPushNotifications')}/>
              </div>
            </div>
          </div>
          <hr className={styles.separator}/>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.fontSizeControlLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                <label className={cx(styles.label, styles.bold)}>
                  {this.state.settings.fontSize}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <div className={styles.pullContentRight}>
                  <div className={styles.col}>
                    <Button
                      onClick={() => this.handleIncreaseFontSize()}
                      color={'success'}
                      icon={'add'}
                      circle={true}
                      tabIndex='0'
                      hideLabel={true}
                      label={intl.formatMessage(intlMessages.increaseFontBtnLabel)}
                      aria-describedby={""}
                    />
                    <div id='sizeUpLabel' hidden>Font size up</div>
                  </div>
                  <div className={styles.col}>
                    <Button
                      onClick={() => this.handleDecreaseFontSize()}
                      color={'success'}
                      icon={'substract'}
                      circle={true}
                      tabIndex='0'
                      hideLabel={true}
                      label={intl.formatMessage(intlMessages.decreaseFontBtnLabel)}
                      aria-describedby={""}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default injectIntl(ApplicationMenu);
