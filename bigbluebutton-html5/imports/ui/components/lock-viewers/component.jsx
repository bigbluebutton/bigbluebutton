import React, { Fragment } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Toggle from '/imports/ui/components/switch/component';
import cx from 'classnames';
import Modal from '/imports/ui/components/modal/simple/component';
import NoteService from '/imports/ui/components/note/service';
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
    description: 'label for webcam toggle',
  },
  otherViewersWebcamLabel: {
    id: 'app.lock-viewers.otherViewersWebcamLabel',
    description: 'label for other viewers webcam toggle',
  },
  microphoneLable: {
    id: 'app.lock-viewers.microphoneLable',
    description: 'label for microphone toggle',
  },
  publicChatLabel: {
    id: 'app.lock-viewers.PublicChatLabel',
    description: 'label for public chat toggle',
  },
  privateChatLable: {
    id: 'app.lock-viewers.PrivateChatLable',
    description: 'label for private chat toggle',
  },
  notesLabel: {
    id: 'app.lock-viewers.notesLabel',
    description: 'label for shared notes toggle',
  },
  userListLabel: {
    id: 'app.lock-viewers.userListLabel',
    description: 'label for user list toggle',
  },
  ariaModalTitle: {
    id: 'app.lock-viewers.ariaTitle',
    description: 'aria label for modal title',
  },
});

const CHAT_ENABLED = Meteor.settings.public.chat.enabled;

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
        contentLabel={intl.formatMessage(intlMessages.ariaModalTitle)}
      >

        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>{intl.formatMessage(intlMessages.lockViewersTitle)}</h2>
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

            {CHAT_ENABLED ? (
              <Fragment>
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
              </Fragment>
            ) : null
            }

            { NoteService.isEnabled()
              ? (
                <div className={styles.row}>
                  <div className={styles.col} aria-hidden="true">
                    <div className={styles.formElement}>
                      <div className={styles.label}>
                        {intl.formatMessage(intlMessages.notesLabel)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.col}>
                    <div className={cx(styles.formElement, styles.pullContentRight)}>
                      <Toggle
                        icons={false}
                        defaultChecked={meeting.lockSettingsProps.disableNote}
                        onChange={() => {
                          meeting.lockSettingsProps.disableNote = !meeting.lockSettingsProps.disableNote;
                          toggleLockSettings(meeting);
                        }}
                        ariaLabel={intl.formatMessage(intlMessages.notesLabel)}
                      />
                    </div>
                  </div>
                </div>
              )
              : null
            }

            <div className={styles.row}>
              <div className={styles.col} aria-hidden="true">
                <div className={styles.formElement}>
                  <div className={styles.label}>
                    {intl.formatMessage(intlMessages.userListLabel)}
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentRight)}>
                  <Toggle
                    icons={false}
                    defaultChecked={meeting.lockSettingsProps.hideUserList}
                    onChange={() => {
                      meeting.lockSettingsProps.hideUserList = !meeting.lockSettingsProps.hideUserList;
                      toggleLockSettings(meeting);
                    }}
                    ariaLabel={intl.formatMessage(intlMessages.userListLabel)}
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
