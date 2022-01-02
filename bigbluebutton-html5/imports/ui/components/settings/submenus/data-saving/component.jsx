import React from 'react';
import cx from 'classnames';
import Toggle from '/imports/ui/components/switch/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import { styles } from '../styles';
import WhiteboardService from '/imports/ui/components/whiteboard/service';
import PresentationService from '/imports/ui/components/presentation/service';

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
  synchronizeWBUpdateLabel: {
    id: 'app.settings.dataSavingTab.synchronizeWBUpdate',
    description: 'whiteboard update synchronization toggle',
  },
  simplifyPencilLabel: {
    id: 'app.settings.dataSavingTab.simplifyPencil',
    description: 'pencil simplification toggle',
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
    
    const whiteboardMode = WhiteboardService.getWhiteboardMode();
    if (Object.keys(whiteboardMode).length > 0) {//should be the case
      if (whiteboardMode.synchronizeWBUpdate != undefined) {
        this.state.settings.synchronizeWBUpdate = whiteboardMode.synchronizeWBUpdate
      }
      if (whiteboardMode.simplifyPencil != undefined) {
        this.state.settings.simplifyPencil = whiteboardMode.simplifyPencil;
      }
    }

    this.handleSyncWBUpdate = this.handleSyncWBUpdate.bind(this);
    this.handleSimplifyPencil = this.handleSimplifyPencil.bind(this);
  }

  handleSyncWBUpdate() {
    this.handleToggle('synchronizeWBUpdate');
  }

  handleSimplifyPencil() {
    this.handleToggle('simplifyPencil');
  }

  render() {
    const { intl, showToggleLabel, displaySettingsStatus } = this.props;

    const { viewParticipantsWebcams, viewScreenshare, synchronizeWBUpdate, simplifyPencil } = this.state.settings;

    const isPresenter = PresentationService.isPresenter('DEFAULT_PRESENTATION_POD');

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
                {displaySettingsStatus(viewParticipantsWebcams)}
                <Toggle
                  icons={false}
                  defaultChecked={viewParticipantsWebcams}
                  onChange={() => this.handleToggle('viewParticipantsWebcams')}
                  ariaLabelledBy="webcamToggle"
                  ariaLabel={intl.formatMessage(intlMessages.webcamLabel)}
                  showToggleLabel={showToggleLabel}
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
                {displaySettingsStatus(viewScreenshare)}
                <Toggle
                  icons={false}
                  defaultChecked={viewScreenshare}
                  onChange={() => this.handleToggle('viewScreenshare')}
                  ariaLabelledBy="screenShare"
                  ariaLabel={intl.formatMessage(intlMessages.screenShareLabel)}
                  showToggleLabel={showToggleLabel}
                />
              </div>
            </div>
          </div>
          {isPresenter ?
          <div className={styles.row}>
            <div className={styles.col} aria-hidden="true">
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.synchronizeWBUpdateLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                {displaySettingsStatus(synchronizeWBUpdate)}
                <Toggle
                  icons={false}
                  defaultChecked={synchronizeWBUpdate}
                  onChange={this.handleSyncWBUpdate}
                  ariaLabelledBy="syncWB"
                  ariaLabel={intl.formatMessage(intlMessages.synchronizeWBUpdateLabel)}
                  showToggleLabel={showToggleLabel}
                />
              </div>
            </div>
          </div> : null}
          {isPresenter && synchronizeWBUpdate ?
          <div className={styles.row}>
            <div className={styles.col} aria-hidden="true">
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.simplifyPencilLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                {displaySettingsStatus(simplifyPencil)}
                <Toggle
                  icons={false}
                  defaultChecked={simplifyPencil}
                  onChange={this.handleSimplifyPencil}
                  ariaLabelledBy="simplifyPencil"
                  ariaLabel={intl.formatMessage(intlMessages.simplifyPencilLabel)}
                  showToggleLabel={showToggleLabel}
                />
              </div>
            </div>
          </div> : null}
        </div>
      </div>
    );
  }
}

export default injectIntl(DataSaving);
