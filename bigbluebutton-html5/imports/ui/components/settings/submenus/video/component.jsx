import React, { Component } from 'react';
import BaseMenu from '../base/component';
import styles from '../styles.scss';

import Toggle from '/imports/ui/components/switch/component';
import cx from 'classnames';

export default class VideoMenu extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'video',
      settings: props.settings,
    };
  }

  render() {
    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>Video</h3>
        </div>

        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  View source
                </label>
                <select
                  defaultValue='-1'
                  className={styles.select}>
                  <option value='-1' disabled>Choose view source</option>
                </select>
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={cx(styles.label, styles.labelSmall)}>
                  Video Quality
                </label>
                <select
                  defaultValue='-1'
                  className={styles.select}>
                  <option value='-1' disabled>Choose the video quality</option>
                </select>
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Viewing participants webcams
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Toggle
                icons={false}
                defaultChecked={this.state.viewParticipantsWebcams}
                onChange={() => this.handleToggle('viewParticipantsWebcams')} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
