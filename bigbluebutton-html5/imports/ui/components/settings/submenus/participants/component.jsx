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
                defaultChecked={true}
                onChange={this.handleBaconChange} />
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
                defaultChecked={true}
                onChange={this.handleBaconChange} />
              </div>
            </div>
          </div>
          <div className={cx(styles.row, styles.spacedLeft)}>
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
                defaultChecked={true}
                onChange={this.handleBaconChange} />
              </div>
            </div>
          </div>
          <div className={cx(styles.row, styles.spacedLeft)}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Lock all participants
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <Checkbox/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
