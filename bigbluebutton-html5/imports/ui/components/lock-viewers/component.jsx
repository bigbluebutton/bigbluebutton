import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Toggle from '/imports/ui/components/switch/component';
import cx from 'classnames';
import Modal from '/imports/ui/components/modal/simple/component';
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
});

class LockViewersComponent extends React.PureComponent {
  render() {
    const {
      intl,
      meeting,
      closeModal,
      toggleLockSettings,
      toggleWebcamsOnlyForModerator,
    } = this.props;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
      >

        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.title}>{intl.formatMessage(intlMessages.lockViewersTitle)}</div>
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
                    defaultChecked={meeting.lockSettingsProps.disableCam}
                    onChange={() => {
                      meeting.lockSettingsProps.disableCam = !meeting.lockSettingsProps.disableCam;
                      toggleLockSettings(meeting);
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
                      meeting.usersProp.webcamsOnlyForModerator = !meeting.usersProp.webcamsOnlyForModerator;
                      toggleWebcamsOnlyForModerator(meeting);
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
                    defaultChecked={meeting.lockSettingsProps.disableMic}
                    onChange={() => {
                      meeting.lockSettingsProps.disableMic = !meeting.lockSettingsProps.disableMic;
                      toggleLockSettings(meeting);
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
                    defaultChecked={meeting.lockSettingsProps.disablePublicChat}
                    onChange={() => {
                      meeting.lockSettingsProps.disablePublicChat = !meeting.lockSettingsProps.disablePublicChat;
                      toggleLockSettings(meeting);
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
                    defaultChecked={meeting.lockSettingsProps.disablePrivateChat}
                    onChange={() => {
                      meeting.lockSettingsProps.disablePrivateChat = !meeting.lockSettingsProps.disablePrivateChat;
                      toggleLockSettings(meeting);
                    }}
                    ariaLabel={intl.formatMessage(intlMessages.privateChatLable)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default injectIntl(LockViewersComponent);
