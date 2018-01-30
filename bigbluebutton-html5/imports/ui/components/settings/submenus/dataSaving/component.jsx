import React from 'react';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import Toggle from '/imports/ui/components/switch/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import { styles } from '../styles';

const MIN_FONTSIZE = 0;
const MAX_FONTSIZE = 4;

const intlMessages = defineMessages({
  dataSavingLabel: {
    id: 'app.settings.dataSaving.label',
    description: 'label for data savings tab',
  },
  webcamLabel: {
    id: 'app.settings.dataSaving.webcam',
    description: 'webcam toggle',
  },
  screenShareLabel: {
    id: 'app.settings.dataSaving.screenShare',
    description: 'screenshare toggle',
  },
  dataSavingDesc: {
    id: 'app.settings.dataSaving.description',
    description: 'description of data savings tab',
  },
});

class DataSaving extends BaseMenu {
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
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.dataSavingLabel)}</h3>
          <p className={styles.subtitle}>{intl.formatMessage(intlMessages.dataSavingDesc)}</p>
        </div>
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col} aria-hidden="true">
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.webcamLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <Toggle
                  icons={false}
                  defaultChecked={!this.state.settings.viewParticipantsWebcams}
                  onChange={() => this.handleToggle('viewParticipantsWebcams')}
                  ariaLabelledBy="webcamToggle"
                  ariaLabel={intl.formatMessage(intlMessages.webcamLabel)}
                />
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col} aria-hidden="true">
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.screenShareLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <Toggle
                  icons={false}
                  defaultChecked={false}
                  onChange={() => this.handleToggle('')}
                  ariaLabelledBy="screenShare"
                  ariaLabel="screenShare"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(DataSaving);
