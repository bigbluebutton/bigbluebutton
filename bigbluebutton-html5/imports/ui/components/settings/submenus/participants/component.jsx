import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import styles from '../styles.scss';
import Toggle from '/imports/ui/components/switch/component';
import Checkbox from '/imports/ui/components/checkbox/component';

export default class ApplicationMenu extends BaseMenu {
  constructor(props) {
    super(props);
    console.log(props);
    const {
      muteAll,
      lockAll,
      webcam,
      microphone,
      publicChat,
      privateChat,
      layout,
    } = props.settings;

    this.state = {
      muteAll,
      lockAll,
      webcam,
      microphone,
      publicChat,
      privateChat,
      layout,
    };

    this.handleUpdateSettings = props.handleUpdateSettings;
  }

  getLockItems() {
    return [
      {
        key: 'webcam',
        label: 'Webcam',
      },
      {
        key: 'microphone',
        label: 'Microphone',
      },
      {
        key: 'publicChat',
        label: 'Public Chat',
      },
      {
        key: 'privateChat',
        label: 'Private Chat',
      },
      {
        key: 'layout',
        label: 'Layout',
      },
    ];
  }

  render() {
    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>Participants</h3>
        </div>
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Mute all except the presenter
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Toggle
                icons={false}
                defaultChecked={this.state.muteAll}
                onChange={() => this.handleToggle('muteAll')} />
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Lock all participants
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Toggle
                icons={false}
                defaultChecked={this.state.lockAll}
                onChange={() => this.handleToggle('lockAll')} />
              </div>
            </div>
          </div>
          {this.getLockItems().map((item, i)  => this.renderLockItem(item, i))}
        </div>
      </div>
    );
  }

  renderLockItem({ label, key }, i) {
    return (
      <div key={i} className={cx(styles.row, styles.spacedLeft)}>
        <div className={styles.col}>
          <div className={styles.formElement}>
            <label className={styles.label}>
              {label}
            </label>
          </div>
        </div>
        <div className={styles.col}>
          <div className={cx(styles.formElement, styles.pullContentRight)}>
            <Checkbox onChange={() => this.handleToggle(key)} checked={this.state[key]}/>
          </div>
        </div>
      </div>
    );
  }
};
