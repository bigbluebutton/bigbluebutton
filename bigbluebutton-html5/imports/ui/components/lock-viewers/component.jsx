import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import Toggle from '/imports/ui/components/switch/component';
import cx from 'classnames';
import Auth from '/imports/ui/services/auth';
import ModalBase from '/imports/ui/components/modal/base/component';
import Meetings from '/imports/api/meetings';
import { styles } from './styles';

const intlMessages = defineMessages({
  lockViewersTitle: {
    id: 'app.lock-viewers.title',
    description: 'lock-viewers title',
  },
  closeLabel: {
    id: 'app.shortcut-help.closeLabel',
    description: 'label for close button',
  },
  closeDesc: {
    id: 'app.shortcut-help.closeDesc',
    description: 'description for close button',
  },
  lockViewersDescription: {
    id: 'app.lock-viewers.description',
    description: 'description for lock viewers feature',
  },
  featuresLable: {
    id: 'app.lock-viewers.featuresLable',
    description: 'features label',
  },
  lockStatusLabel: {
    id: 'app.lock-viewers.lockStatusLabel',
    description: 'description for close button',
  },
  webcamLabel: {
    id: 'app.lock-viewers.webcamLabel',
    description: 'description for close button',
  },
  otherViewersWebcamLabel: {
    id: 'app.lock-viewers.otherViewersWebcamLabel',
    description: 'description for close button',
  },
  microphoneLable: {
    id: 'app.lock-viewers.microphoneLable',
    description: 'description for close button',
  },
  publicChatLabel: {
    id: 'app.lock-viewers.PublicChatLabel',
    description: 'description for close button',
  },
  privateChatLable: {
    id: 'app.lock-viewers.PrivateChatLable',
    description: 'description for close button',
  },
  layoutLable: {
    id: 'app.lock-viewers.Layout',
    description: 'description for close button',
  },
});

class LockViewersComponent extends Component {
  constructor(props) {
    super(props);
    const {
      closeModal,
      toggleLockSettings,
      toggleWebcamsOnlyForModerator,
    } = props;

    this.closeModal = closeModal;
    this.toggleLockSettings = toggleLockSettings;
    this.toggleWebcamsOnlyForModerator = toggleWebcamsOnlyForModerator;
  }

  render() {
    const { intl } = this.props;
    const meetingId = Auth.meetingID;
    const meeting = Meetings.findOne({ meetingId });

    return (
      <ModalBase
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={this.closeModal}
      >

        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.title}>{intl.formatMessage(intlMessages.lockViewersTitle)}</div>
            <Button
              data-test="modalBaseCloseButton"
              className={styles.closeBtn}
              label={intl.formatMessage(intlMessages.closeLabel)}
              icon="close"
              size="md"
              hideLabel
              onClick={this.closeModal}
            />
          </div>
          <div className={styles.description}>
            {`${intl.formatMessage(intlMessages.lockViewersDescription)}`}
          </div>

          <div className={styles.form}>
            <header className={styles.subHeader}>
              <div className={styles.bold}>{intl.formatMessage(intlMessages.featuresLable)}</div>
              <div className={styles.bold}>{intl.formatMessage(intlMessages.lockStatusLabel)}</div>
            </header>
            <div className={styles.row}>
              <div className={styles.col} aria-hidden="true">
                <div className={styles.formElement}>
                  <div className={styles.label}>
                    {intl.formatMessage(intlMessages.webcamLabel)}
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentRight)}>
                  <Toggle
                    icons={false}
                    defaultChecked={meeting.lockSettingsProp.disableCam}
                    onChange={() => {
                      meeting.lockSettingsProp.disableCam =
                        !meeting.lockSettingsProp.disableCam;
                      this.toggleLockSettings(meeting);
                    }}
                    ariaLabel={intl.formatMessage(intlMessages.webcamLabel)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.col} aria-hidden="true">
                <div className={styles.formElement}>
                  <div className={styles.label}>
                    {intl.formatMessage(intlMessages.otherViewersWebcamLabel)}
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentRight)}>
                  <Toggle
                    icons={false}
                    defaultChecked={meeting.usersProp.webcamsOnlyForModerator}
                    onChange={() => {
                      meeting.usersProp.webcamsOnlyForModerator =
                        !meeting.usersProp.webcamsOnlyForModerator;
                      this.toggleWebcamsOnlyForModerator(meeting);
                    }}
                    ariaLabel={intl.formatMessage(intlMessages.otherViewersWebcamLabel)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.col} aria-hidden="true">
                <div className={styles.formElement}>
                  <div className={styles.label}>
                    {intl.formatMessage(intlMessages.microphoneLable)}
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentRight)}>
                  <Toggle
                    icons={false}
                    defaultChecked={meeting.lockSettingsProp.disableMic}
                    onChange={() => {
                      meeting.lockSettingsProp.disableMic =
                        !meeting.lockSettingsProp.disableMic;
                      this.toggleLockSettings(meeting);
                    }}
                    ariaLabel={intl.formatMessage(intlMessages.microphoneLable)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.col} aria-hidden="true">
                <div className={styles.formElement}>
                  <div className={styles.label}>
                    {intl.formatMessage(intlMessages.publicChatLabel)}
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentRight)}>
                  <Toggle
                    icons={false}
                    defaultChecked={meeting.lockSettingsProp.disablePubChat}
                    onChange={() => {
                      meeting.lockSettingsProp.disablePubChat =
                        !meeting.lockSettingsProp.disablePubChat;
                      this.toggleLockSettings(meeting);
                    }}
                    ariaLabel={intl.formatMessage(intlMessages.publicChatLabel)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.col} aria-hidden="true">
                <div className={styles.formElement}>
                  <div className={styles.label}>
                    {intl.formatMessage(intlMessages.privateChatLable)}
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentRight)}>
                  <Toggle
                    icons={false}
                    defaultChecked={meeting.lockSettingsProp.disablePrivChat}
                    onChange={() => {
                      meeting.lockSettingsProp.disablePrivChat =
                        !meeting.lockSettingsProp.disablePrivChat;
                      this.toggleLockSettings(meeting);
                    }}
                    ariaLabel={intl.formatMessage(intlMessages.privateChatLable)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.col} aria-hidden="true">
                <div className={styles.formElement}>
                  <div className={styles.label}>
                    {intl.formatMessage(intlMessages.layoutLable)}
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentRight)}>
                  <Toggle
                    icons={false}
                    defaultChecked={meeting.lockSettingsProp.lockedLayout}
                    onChange={() => {
                      meeting.lockSettingsProp.lockedLayout =
                        !meeting.lockSettingsProp.lockedLayout;
                      this.toggleLockSettings(meeting);
                    }}
                    ariaLabel={intl.formatMessage(intlMessages.layoutLable)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBase>
    );
  }
}

export default injectIntl(LockViewersComponent);
