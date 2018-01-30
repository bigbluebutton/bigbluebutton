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
  DataSavingLabel: {
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
});

class DataSaving extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'application',
      settings: props.settings,
    };
  }
  render() {
    const { intl } = this.props;

    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.DataSavingLabel)}</h3>
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
                  defaultChecked={false}
                  onChange={() => this.handleToggle('')}
                  ariaLabelledBy="audioNotify"
                  ariaLabel="hahah2"
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
