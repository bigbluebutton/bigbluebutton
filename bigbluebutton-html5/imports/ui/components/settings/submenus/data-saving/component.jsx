import React from 'react';
import cx from 'classnames';
import Toggle from '/imports/ui/components/switch/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import { styles } from '../styles';

const intlMessages = defineMessages({
  dataSavingLabel: {
    id: 'app.settings.dataSavingTab.label',
    description: 'label for data savings tab',
  },
  webcamLabel: {
    id: 'app.settings.dataSavingTab.webcam',
    description: 'webcam toggle',
  },
  screenShareLabel: {
    id: 'app.settings.dataSavingTab.screenShare',
    description: 'screenshare toggle',
  },
  dataSavingDesc: {
    id: 'app.settings.dataSavingTab.description',
    description: 'description of data savings tab',
  },
});

class DataSaving extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'dataSaving',
      settings: props.settings,
    };
  }

  render() {
    const { intl } = this.props;

    const { viewParticipantsWebcams, viewScreenshare } = this.state.settings;

    return (
      <div>
        <div>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.dataSavingLabel)}</h3>
          <h4 className={styles.subtitle}>{intl.formatMessage(intlMessages.dataSavingDesc)}</h4>
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
                  defaultChecked={viewParticipantsWebcams}
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
                  defaultChecked={viewScreenshare}
                  onChange={() => this.handleToggle('viewScreenshare')}
                  ariaLabelledBy="screenShare"
                  ariaLabel={intl.formatMessage(intlMessages.screenShareLabel)}
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
