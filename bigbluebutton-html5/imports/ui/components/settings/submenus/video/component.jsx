import React, { Component } from 'react';
import BaseMenu from '../base/component';
import styles from '../styles.scss';
import { defineMessages, injectIntl } from 'react-intl';
import Toggle from '/imports/ui/components/switch/component';
import cx from 'classnames';

const intlMessages = defineMessages({
  videoSectionTitle: {
    id: 'app.submenu.video.title',
    description: 'Heading for video submenu section',
  },
  videoSourceLabel: {
    id: 'app.submenu.video.videoSourceLabel',
    description: 'Label for video source section',
  },
  videoOptionLabel: {
    id: 'app.submenu.video.videoOptionLabel',
    description: 'default video source option label',
  },
  videoQualityLabel: {
    id: 'app.submenu.video.videoQualityLabel',
    description: 'Label for video quality section',
  },
  qualityOptionLabel: {
    id: 'app.submenu.video.qualityOptionLabel',
    description: 'default quality option label',
  },
  participantsCamLabel: {
    id: 'app.submenu.video.participantsCamLabel',
    description: 'Label for participants cam section',
  },
});

class VideoMenu extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'video',
      settings: props.settings,
    };
  }

  render() {
    const { intl } = this.props;

    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.videoSectionTitle)}</h3>
        </div>

        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div
                className={styles.formElement}
                aria-label={intl.formatMessage(intlMessages.videoSourceLabel)}
              >
                <label className={cx(styles.label, styles.labelSmall)}>
                  {intl.formatMessage(intlMessages.videoSourceLabel)}
                </label>
                <select
                  defaultValue="-1"
                  className={styles.select}
                >
                  <option value="-1" disabled>
                    {intl.formatMessage(intlMessages.videoOptionLabel)}
                  </option>
                </select>
              </div>
            </div>
            <div className={styles.col}>
              <div
                className={styles.formElement}
                aria-label={intl.formatMessage(intlMessages.videoQualityLabel)}
              >
                <label className={cx(styles.label, styles.labelSmall)}>
                  {intl.formatMessage(intlMessages.videoQualityLabel)}
                </label>
                <select
                  defaultValue="-1"
                  className={styles.select}
                >
                  <option value="-1" disabled>
                    {intl.formatMessage(intlMessages.qualityOptionLabel)}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.participantsCamLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <Toggle
                  icons={false}
                  defaultChecked={this.state.viewParticipantsWebcams}
                  onChange={() => this.handleToggle('viewParticipantsWebcams')}
                  ariaLabelledBy={'viewCamLabel'}
                  ariaLabel={intl.formatMessage(intlMessages.participantsCamLabel)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(VideoMenu);
